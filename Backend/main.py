from flask import Flask
from flask_cors import CORS
from signup_login import signup_routes
from DevAcctSignup_login import dev_acct_signup_routes
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:5173"]}}, supports_credentials=True)

app.register_blueprint(signup_routes)
app.register_blueprint(dev_acct_signup_routes)

app.secret_key = "secret_key"

if __name__ == "__main__":
    app.run(port=5000, debug=True)
