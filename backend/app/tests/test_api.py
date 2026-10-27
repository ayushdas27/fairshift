import pytest
import httpx

client = httpx.Client(base_url="http://127.0.0.1:8000", timeout=10.0)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_worker_login_success():
    res = client.post("/api/v1/auth/login", json={
        "identifier": "EMP-88204",
        "password": "FairShift@2026"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["full_name"] == "Elena Rostova"
    assert data["user"]["role"] == "worker"

def test_admin_login_success():
    res = client.post("/api/v1/auth/login", json={
        "identifier": "m.adams@facility.fairshift.org",
        "password": "FairShift@2026"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["user"]["role"] == "admin"

def test_login_invalid_password_rejected():
    res = client.post("/api/v1/auth/login", json={
        "identifier": "EMP-88204",
        "password": "WrongPassword!"
    })
    assert res.status_code == 401

def test_unauthenticated_access_denied():
    res = client.get("/api/v1/attendance")
    assert res.status_code == 401

def test_worker_attendance_duplicate_checkin_denied():
    login_res = client.post("/api/v1/auth/login", json={
        "identifier": "EMP-88204",
        "password": "FairShift@2026"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Worker already has an active shift from seed data
    checkin_res = client.post("/api/v1/attendance/check-in", headers=headers, json={
        "qr_token": "FS-NEW-QR"
    })
    assert checkin_res.status_code == 400
    assert "Duplicate check-in rejected" in checkin_res.json()["detail"]

def test_worker_view_own_payslip_and_breakdown():
    login_res = client.post("/api/v1/auth/login", json={
        "identifier": "EMP-88204",
        "password": "FairShift@2026"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/payroll/me", headers=headers)
    assert res.status_code == 200
    payslips = res.json()
    assert len(payslips) > 0
    p = payslips[0]
    assert p["base_pay"] == 1710.00
    assert p["overtime_earnings"] == 151.88
    assert p["net_pay"] == 1842.50
    assert len(p["line_items"]) == 4

def test_worker_cannot_access_another_worker_payslip():
    # Login as Elena
    login_elena = client.post("/api/v1/auth/login", json={
        "identifier": "EMP-88204",
        "password": "FairShift@2026"
    })
    token_elena = login_elena.json()["access_token"]
    
    # Login as College Worker Rahul
    login_rahul = client.post("/api/v1/auth/login", json={
        "identifier": "EMP-91402",
        "password": "FairShift@2026"
    })
    token_rahul = login_rahul.json()["access_token"]
    rahul_payslips = client.get("/api/v1/payroll/me", headers={"Authorization": f"Bearer {token_rahul}"}).json()
    rahul_payslip_id = rahul_payslips[0]["id"]

    # Elena attempts to access Rahul's payslip
    forbidden_res = client.get(f"/api/v1/payroll/me/{rahul_payslip_id}", headers={"Authorization": f"Bearer {token_elena}"})
    assert forbidden_res.status_code in [403, 404]

def test_anonymous_grievance_workflow():
    # Submit anonymous complaint without login
    res = client.post("/api/v1/grievances/anonymous", json={
        "org_code": "APEX-BLD",
        "category": "Workplace Safety Hazard",
        "description": "Loose electrical conduit near basement water pump.",
        "severity": "High"
    })
    assert res.status_code == 200
    receipt = res.json()
    assert "tracking_number" in receipt
    assert "tracking_secret" in receipt
    tracking_no = receipt["tracking_number"]
    secret = receipt["tracking_secret"]

    # Track status anonymously
    track_res = client.post("/api/v1/grievances/track", json={
        "tracking_number": tracking_no,
        "tracking_secret": secret
    })
    assert track_res.status_code == 200
    assert track_res.json()["status"] == "Submitted"
    assert track_res.json()["is_anonymous"] is True

    # Bad secret rejected
    bad_res = client.post("/api/v1/grievances/track", json={
        "tracking_number": tracking_no,
        "tracking_secret": "SEC-wrong-secret"
    })
    assert bad_res.status_code == 401

def test_admin_grievance_status_update():
    login_admin = client.post("/api/v1/auth/login", json={
        "identifier": "m.adams@facility.fairshift.org",
        "password": "FairShift@2026"
    })
    token_admin = login_admin.json()["access_token"]
    headers = {"Authorization": f"Bearer {token_admin}"}

    # Fetch admin grievances
    list_res = client.get("/api/v1/grievances/admin/all", headers=headers)
    assert list_res.status_code == 200
    cases = list_res.json()
    assert len(cases) > 0
    target_case = cases[0]

    # Update status to Action in Progress
    update_res = client.post(
        f"/api/v1/grievances/admin/{target_case['id']}/status",
        headers=headers,
        json={"status": "Action in Progress", "notes": "Safety contractor dispatched"}
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "Action in Progress"

def test_portable_skill_passport():
    login_res = client.post("/api/v1/auth/login", json={
        "identifier": "EMP-88204",
        "password": "FairShift@2026"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/skills/me/export", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "passport_id" in data
    assert "verified_credentials" in data
    assert len(data["verified_credentials"]) >= 2

def test_both_industries_available():
    res = client.get("/api/v1/organisations")
    assert res.status_code == 200
    orgs = res.json()
    industries = [o["industry"] for o in orgs]
    assert "construction" in industries
    assert "college" in industries
