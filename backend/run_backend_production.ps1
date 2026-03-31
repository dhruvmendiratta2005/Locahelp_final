$ErrorActionPreference = "Stop"
Set-Location "D:\Locahelp-SEPM_Final\backend"
$env:FLASK_ENV = "production"
.\.venv\Scripts\python.exe -c "from app import create_app; app = create_app(); app.run(debug=False, host='127.0.0.1', port=5001)"
