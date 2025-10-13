from flask import Flask
from flask_cors import CORS
from config import config

# 蓝图
from routes.lesson import bp as lesson_bp
from routes.qa import bp as qa_bp
from routes.assignment import bp as assignment_bp
from routes.report import bp as report_bp

def create_app():
    app = Flask(__name__)
    # 允许前端本地开发端口访问
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173"]}})

    # 蓝图注册并加上统一前缀 /api
    app.register_blueprint(lesson_bp, url_prefix="/api/lesson")
    app.register_blueprint(qa_bp, url_prefix="/api/qa")
    app.register_blueprint(assignment_bp, url_prefix="/api/assignment")
    app.register_blueprint(report_bp, url_prefix="/api/report")
    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=config.PORT, debug=True)