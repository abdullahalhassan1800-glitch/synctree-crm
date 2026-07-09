$baseUrl = "http://localhost:5000/api"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "=== SycnTree CRM Sample Data Seeder ===" -ForegroundColor Cyan

# 1. Login as admin
Write-Host "[1/6] Logging in as admin..." -ForegroundColor Yellow
$login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Headers $headers -Body (@{ email = "admin@synctree.com"; password = "admin123" } | ConvertTo-Json)
$token = $login.token
$adminId = $login.user._id
$authHeaders = @{ "Content-Type" = "application/json"; "Authorization" = "Bearer $token" }
Write-Host "  Admin logged in: $($login.user.name) ($($login.user.email))" -ForegroundColor Green

# 2. Create additional users
Write-Host "[2/6] Creating users..." -ForegroundColor Yellow
$users = @(
  @{ name = "Rahul Sharma"; email = "rahul@synctree.com"; phone = "9876543210"; password = "user123"; roleName = "manager" },
  @{ name = "Priya Patel"; email = "priya@synctree.com"; phone = "9876543211"; password = "user123"; roleName = "sales_rep" },
  @{ name = "Amit Singh"; email = "amit@synctree.com"; phone = "9876543212"; password = "user123"; roleName = "sales_rep" },
  @{ name = "Sneha Gupta"; email = "sneha@synctree.com"; phone = "9876543213"; password = "user123"; roleName = "support" },
  @{ name = "Vikram Joshi"; email = "vikram@synctree.com"; phone = "9876543214"; password = "user123"; roleName = "hr" },
  @{ name = "Neha Verma"; email = "neha@synctree.com"; phone = "9876543215"; password = "user123"; roleName = "sales_rep" },
  @{ name = "Arjun Reddy"; email = "arjun@synctree.com"; phone = "9876543216"; password = "user123"; roleName = "support" },
  @{ name = "Pooja Mehta"; email = "pooja@synctree.com"; phone = "9876543217"; password = "user123"; roleName = "sales_rep" }
)

$createdUsers = @()
foreach ($user in $users) {
  try {
    $resp = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Headers $authHeaders -Body ($user | ConvertTo-Json)
    $createdUsers += $resp.user
    Write-Host "  Created user: $($user.name) ($($user.roleName))" -ForegroundColor Green
  } catch {
    $err = $_.Exception.Response
    if ($err.StatusCode -eq 400) {
      Write-Host "  User already exists: $($user.email)" -ForegroundColor DarkYellow
    } else {
      Write-Host "  Error creating $($user.email): $_" -ForegroundColor Red
    }
  }
}

# Add admin to list too
$createdUsers += $login.user

# 3. Get lead stages
Write-Host "[3/6] Fetching lead stages..." -ForegroundColor Yellow
$stagesResp = Invoke-RestMethod -Uri "$baseUrl/leads/stages" -Method Get -Headers $authHeaders
$stages = $stagesResp.stages
Write-Host "  Found $($stages.Count) stages" -ForegroundColor Green

function Get-RandomUser {
  param($users)
  return $users[(Get-Random -Maximum $users.Count)]._id
}

function Get-RandomStage {
  param($stages)
  return $stages[(Get-Random -Maximum $stages.Count)]
}

# 4. Create Leads
Write-Host "[4/6] Creating leads..." -ForegroundColor Yellow
$leadData = @(
  @{ firstName = "Rajesh"; lastName = "Kumar"; email = "rajesh.k@example.com"; phone = "9988776651"; company = "TechVista Solutions"; position = "CEO"; source = "website"; score = 85; tags = @("tech", "hot"); budget = 500000; notes = "Interested in enterprise plan" },
  @{ firstName = "Anita"; lastName = "Desai"; email = "anita.d@example.com"; phone = "9988776652"; company = "GreenLeaf Corp"; position = "Marketing Head"; source = "referral"; score = 72; tags = @("marketing", "warm"); budget = 200000; notes = "Referred by Priya Patel" },
  @{ firstName = "Vijay"; lastName = "Malhotra"; email = "vijay.m@example.com"; phone = "9988776653"; company = "Apex Industries"; position = "Director"; source = "linkedin"; score = 60; tags = @("manufacturing"); budget = 1000000; notes = "Needs custom integration" },
  @{ firstName = "Kavita"; lastName = "Nair"; email = "kavita.n@example.com"; phone = "9988776654"; company = "DigitalWave Agency"; position = "Owner"; source = "manual"; score = 45; tags = @("agency", "small"); budget = 75000; notes = "Small team, basic CRM needed" },
  @{ firstName = "Suresh"; lastName = "Reddy"; email = "suresh.r@example.com"; phone = "9988776655"; company = "MediCare Plus"; position = "CTO"; source = "website"; score = 90; tags = @("healthcare", "hot"); budget = 800000; notes = "Security is a priority" },
  @{ firstName = "Deepa"; lastName = "Sharma"; email = "deepa.s@example.com"; phone = "9988776656"; company = "EduStar Learning"; position = "Founder"; source = "event"; score = 55; tags = @("education", "startup"); budget = 150000; notes = "Met at EduTech Summit 2026" },
  @{ firstName = "Rohit"; lastName = "Verma"; email = "rohit.v@example.com"; phone = "9988776657"; company = "Skyline Builders"; position = "MD"; source = "referral"; score = 68; tags = @("realestate", "warm"); budget = 350000; notes = "Wants demo for 15 users" },
  @{ firstName = "Meera"; lastName = "Iyengar"; email = "meera.i@example.com"; phone = "9988776658"; company = "Sage Accounting"; position = "VP Sales"; source = "linkedin"; score = 78; tags = @("fintech", "hot"); budget = 450000; notes = "Comparing with Salesforce" },
  @{ firstName = "Akash"; lastName = "Thakur"; email = "akash.t@example.com"; phone = "9988776659"; company = "FreshCart Grocery"; position = "Operations Head"; source = "website"; score = 35; tags = @("retail"); budget = 100000; notes = "Budget constrained" },
  @{ firstName = "Nisha"; lastName = "Patil"; email = "nisha.p@example.com"; phone = "9988776660"; company = "BrightFuture NGO"; position = "Director"; source = "manual"; score = 40; tags = @("nonprofit"); budget = 0; notes = "Looking for free tier options" },
  @{ firstName = "Gaurav"; lastName = "Saxena"; email = "gaurav.s@example.com"; phone = "9988776661"; company = "CloudNine Tech"; position = "CEO"; source = "referral"; score = 82; tags = @("tech", "hot"); budget = 600000; notes = "Needs API access" },
  @{ firstName = "Tara"; lastName = "Kapoor"; email = "tara.k@example.com"; phone = "9988776662"; company = "StyleHub Fashion"; position = "Owner"; source = "instagram"; score = 50; tags = @("fashion", "small"); budget = 80000; notes = "Loves the UI shown in demo" }
)

$createdLeads = @()
foreach ($ld in $leadData) {
  try {
    $stage = Get-RandomStage $stages
    $assignedTo = Get-RandomUser $createdUsers
    $body = $ld + @{ assignedTo = $assignedTo; stage = $stage._id; stageName = $stage.name }
    $resp = Invoke-RestMethod -Uri "$baseUrl/leads" -Method Post -Headers $authHeaders -Body ($body | ConvertTo-Json)
    $createdLeads += $resp.lead
    Write-Host "  Created lead: $($ld.firstName) $($ld.lastName) [$($stage.name)]" -ForegroundColor Green
  } catch {
    Write-Host "  Error creating lead $($ld.firstName) $($ld.lastName): $_" -ForegroundColor Red
  }
}

# 5. Create Contacts
Write-Host "[5/6] Creating contacts..." -ForegroundColor Yellow
$contactData = @(
  @{ firstName = "Sunil"; lastName = "Agarwal"; email = "sunil.a@partner.com"; phone = "8877665541"; company = "InfoSync Partners"; position = "Partner"; address = "Bandra West, Mumbai"; city = "Mumbai"; state = "Maharashtra"; country = "India"; segments = @("partner", "technology") },
  @{ firstName = "Rekha"; lastName = "Menon"; email = "rekha.m@partner.com"; phone = "8877665542"; company = "CloudBase Services"; position = "VP Alliances"; address = "Koramangala, Bangalore"; city = "Bangalore"; state = "Karnataka"; country = "India"; segments = @("partner", "cloud") },
  @{ firstName = "Imran"; lastName = "Khan"; email = "imran.k@supplier.com"; phone = "8877665543"; company = "DataPro Solutions"; position = "Account Manager"; address = "Connaught Place, Delhi"; city = "Delhi"; state = "Delhi"; country = "India"; segments = @("vendor") },
  @{ firstName = "Divya"; lastName = "Chopra"; email = "divya.c@client.com"; phone = "8877665544"; company = "WebCraft Studios"; position = "CEO"; address = "MG Road, Pune"; city = "Pune"; state = "Maharashtra"; country = "India"; segments = @("client", "technology"); notes = "Uses our enterprise plan" },
  @{ firstName = "Prakash"; lastName = "Rao"; email = "prakash.r@client.com"; phone = "8877665545"; company = "ShopEasy Retail"; position = "IT Head"; address = "Gachibowli, Hyderabad"; city = "Hyderabad"; state = "Telangana"; country = "India"; segments = @("client", "retail"); notes = "Uses pro plan with 50 users" },
  @{ firstName = "Lata"; lastName = "Srinivas"; email = "lata.s@client.com"; phone = "8877665546"; company = "HealthFirst Diagnostics"; position = "CEO"; address = "T Nagar, Chennai"; city = "Chennai"; state = "Tamil Nadu"; country = "India"; segments = @("client", "healthcare"); notes = "Custom integration client" },
  @{ firstName = "Karan"; lastName = "Mehta"; email = "karan.m@lead.com"; phone = "8877665547"; company = "NextGen AI"; position = "Founder"; address = "Sector 62, Noida"; city = "Noida"; state = "UP"; country = "India"; segments = @("lead", "ai") }
)

foreach ($cd in $contactData) {
  try {
    $assignedTo = Get-RandomUser $createdUsers
    $body = $cd + @{ assignedTo = $assignedTo }
    $resp = Invoke-RestMethod -Uri "$baseUrl/contacts" -Method Post -Headers $authHeaders -Body ($body | ConvertTo-Json)
    Write-Host "  Created contact: $($cd.firstName) $($cd.lastName) [$($cd.company)]" -ForegroundColor Green
  } catch {
    Write-Host "  Error creating contact $($cd.firstName) $($cd.lastName): $_" -ForegroundColor Red
  }
}

# 6. Create Deals
Write-Host "[6/6] Creating deals..." -ForegroundColor Yellow
$dealData = @(
  @{ title = "Enterprise Plan - TechVista"; value = 500000; probability = 60; notes = "Negotiating contract terms"; tags = @("enterprise", "tech") },
  @{ title = "Pro Plan - GreenLeaf Corp"; value = 200000; probability = 80; notes = "Verbal commitment received"; tags = @("pro", "marketing") },
  @{ title = "Enterprise Plan - MediCare Plus"; value = 800000; probability = 30; notes = "Technical evaluation in progress"; tags = @("enterprise", "healthcare") },
  @{ title = "Team Plan - CloudNine Tech"; value = 600000; probability = 70; notes = "Demo completed, proposal sent"; tags = @("team", "tech") },
  @{ title = "Basic Plan - DigitalWave"; value = 75000; probability = 90; notes = "Contract signed, awaiting payment"; tags = @("basic", "agency") },
  @{ title = "Pro Plan - Sage Accounting"; value = 450000; probability = 45; notes = "Competing with Salesforce"; tags = @("pro", "fintech") },
  @{ title = "Team Plan - Skyline Builders"; value = 350000; probability = 55; notes = "Second demo scheduled"; tags = @("team", "realestate") }
)

$wonStage = $stages | Where-Object { $_.name -eq "Closed Won" }
$openStages = $stages | Where-Object { $_.name -ne "Closed Won" -and $_.name -ne "Closed Lost" }

foreach ($dd in $dealData) {
  try {
    $stage = if ($dd.title -eq "Enterprise Plan - TechVista" -or $dd.title -eq "Team Plan - CloudNine Tech") { $stages | Where-Object { $_.name -eq "Negotiation" } } else { $openStages[(Get-Random -Maximum $openStages.Count)] }
    $assignedTo = Get-RandomUser $createdUsers
    $body = $dd + @{ assignedTo = $assignedTo; stage = $stage._id; stageName = $stage.name; status = "open"; expectedCloseDate = (Get-Date).AddDays((Get-Random -Minimum 15 -Maximum 90)).ToString("yyyy-MM-dd") }
    $resp = Invoke-RestMethod -Uri "$baseUrl/deals" -Method Post -Headers $authHeaders -Body ($body | ConvertTo-Json)
    Write-Host "  Created deal: $($dd.title) (₹$($dd.value))" -ForegroundColor Green
  } catch {
    Write-Host "  Error creating deal $($dd.title): $_" -ForegroundColor Red
  }
}

# 7. Create Tickets
Write-Host "--- Creating support tickets..." -ForegroundColor Yellow
$ticketData = @(
  @{ subject = "Unable to login to dashboard"; description = "User gets 500 error on login page after password reset"; priority = "high"; category = "bug" },
  @{ subject = "Add new user field for GST number"; description = "Need a custom field for GST registration number in contact form"; priority = "medium"; category = "feature" },
  @{ subject = "Report generation timeout"; description = "Monthly report fails to generate for accounts with >1000 contacts"; priority = "urgent"; category = "performance" },
  @{ subject = "Email notification not sending"; description = "Welcome emails not being delivered to new signups since yesterday"; priority = "high"; category = "bug" },
  @{ subject = "Mobile app crash on Android 14"; description = "App crashes when trying to upload profile photo on Android 14 devices"; priority = "medium"; category = "bug" },
  @{ subject = "Request: Dark mode toggle"; description = "Would be great to have dark mode support in the web app"; priority = "low"; category = "feature" },
  @{ subject = "Data export taking too long"; description = "Exporting 5000 leads takes over 10 minutes"; priority = "medium"; category = "performance" }
)

foreach ($td in $ticketData) {
  try {
    $assignedTo = Get-RandomUser $createdUsers
    $body = $td + @{ assignedTo = $assignedTo; status = "open" }
    $resp = Invoke-RestMethod -Uri "$baseUrl/tickets" -Method Post -Headers $authHeaders -Body ($body | ConvertTo-Json)
    Write-Host "  Created ticket: $($td.subject)" -ForegroundColor Green
  } catch {
    Write-Host "  Error creating ticket $($td.subject): $_" -ForegroundColor Red
  }
}

Write-Host "`n=== Sample data seeded successfully! ===" -ForegroundColor Cyan
Write-Host "Log in at http://localhost:5173 with admin@synctree.com / admin123" -ForegroundColor White
