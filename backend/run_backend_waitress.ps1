$ErrorActionPreference = "Stop"
Set-Location "D:\Locahelp-SEPM_Final\backend"
$env:FLASK_ENV = "production"
.\.venv\Scripts\python.exe -m waitress --host 127.0.0.1 --port 5001 --call "app:create_app"
