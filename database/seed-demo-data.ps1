# Creates demo data for SeatIQ: subjects, halls, exams and 180 students.
# Safe to run more than once: items that already exist are skipped.

$base = "http://localhost:8080/api"
$created = 0
$skipped = 0

function Send-Json($path, $body) {
    try {
        $json = ConvertTo-Json -InputObject $body -Depth 5
        Invoke-RestMethod -Uri "$base/$path" -Method Post -ContentType "application/json" -Body $json | Out-Null
        $script:created++
    } catch {
        $script:skipped++
    }
}

# 1. Subjects
$subjects = @(
    @{ code = "CS301"; name = "Database Management Systems" },
    @{ code = "EC301"; name = "Digital Signal Processing" },
    @{ code = "MA201"; name = "Engineering Mathematics" },
    @{ code = "CE301"; name = "Structural Analysis" },
    @{ code = "EE301"; name = "Circuit Theory" }
)
foreach ($s in $subjects) { Send-Json "subjects" $s }

# 2. Halls (60 + 60 + 80 = 200 seats)
$halls = @(
    @{ name = "Hall A"; rows = 5; benches = 6; seatsPerBench = 2; available = $true },
    @{ name = "Hall B"; rows = 5; benches = 6; seatsPerBench = 2; available = $true },
    @{ name = "Hall C"; rows = 5; benches = 8; seatsPerBench = 2; available = $true }
)
foreach ($h in $halls) { Send-Json "halls" $h }

# 3. Exams: one per branch, all in the same slot (10 days from today, 10:00 to 13:00)
$examDate = (Get-Date).AddDays(10).ToString("yyyy-MM-dd")
$allSubjects = Invoke-RestMethod -Uri "$base/subjects"
$branchSubject = @{ CSE = "CS301"; ECE = "EC301"; MECH = "MA201"; CIVIL = "CE301"; EEE = "EE301" }
foreach ($branch in $branchSubject.Keys) {
    $subject = $allSubjects | Where-Object { $_.code -eq $branchSubject[$branch] }
    $exam = @{ subjectId = $subject.id; date = $examDate; startTime = "10:00"; endTime = "13:00"; branches = @($branch) }
    Send-Json "exams" $exam
}

# 4. Students: 36 per branch = 180 (every 6th one is a repeater)
$prefix = @{ CSE = "CS"; ECE = "EC"; MECH = "ME"; CIVIL = "CE"; EEE = "EE" }
foreach ($branch in $prefix.Keys) {
    for ($i = 1; $i -le 36; $i++) {
        $roll = "{0}{1:000}" -f $prefix[$branch], $i
        $type = "Regular"
        if ($i % 6 -eq 0) { $type = "Repeater" }
        $student = @{ rollNo = $roll; name = "Student $roll"; branch = $branch; semester = 5; type = $type }
        Send-Json "students" $student
    }
}

Write-Host "Created: $created, skipped (already existed or failed): $skipped"
Write-Host "Demo exam date: $examDate"