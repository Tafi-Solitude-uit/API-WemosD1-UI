from flask import Flask, request, jsonify
import psycopg2
from flask_cors import CORS
from psycopg2.extras import RealDictCursor

# Khởi tạo Flask app
app = Flask(__name__)
CORS(app)

# Cấu hình kết nối database PostgreSQL
DB_CONFIG = {
    "host": "34.174.123.242",  # Docker container PostgreSQL chạy trên localhost
    "database": "iot",    # Tên database
    "user": "admin",      # Tên người dùng
    "password": "admin"   # Mật khẩu
}

# Hàm kết nối với database
def get_db_connection():
    conn = psycopg2.connect(
        host=DB_CONFIG["host"],
        database=DB_CONFIG["database"],
        user=DB_CONFIG["user"],
        password=DB_CONFIG["password"]
    )
    return conn


# API nhận dữ liệu từ thiết bị Wemos D1
@app.route('/data', methods=['POST'])
def receive_data():
    try:
        # Lấy dữ liệu JSON từ request
        data = request.get_json()
        temperature = data.get('temperature')
        humidity = data.get('humidity')
        air_quality = data.get('airQuality')

        # Kiểm tra dữ liệu đầu vào
        if temperature is None or humidity is None or air_quality is None:
            return jsonify({"error": "Missing data fields"}), 400

        # Kết nối với database và lưu dữ liệu
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO sensor_data (temperature, humidity, air_quality) VALUES (%s, %s, %s)",
            (temperature, humidity, air_quality)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Data received and saved"}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal server error"}), 500


# API lấy dữ liệu từ database để hiển thị trên UI
@app.route('/data', methods=['GET'])
def get_data():
    try:
        # Kết nối với database
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Truy vấn dữ liệu cảm biến
        cursor.execute("SELECT temperature, humidity, air_quality, timestamp FROM sensor_data ORDER BY timestamp DESC LIMIT 50")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        # Trả về dữ liệu dưới dạng JSON
        return jsonify(rows), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal server error"}), 500


# Hàm khởi tạo database (chạy một lần để tạo bảng nếu chưa có)
def init_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sensor_data (
                id SERIAL PRIMARY KEY,
                temperature REAL,
                humidity REAL,
                air_quality REAL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        cursor.close()
        conn.close()
        print("Database initialized successfully!")
    except Exception as e:
        print(f"Error initializing database: {e}")


# Chạy server
if __name__ == '__main__':
    init_db()  # Khởi tạo database nếu cần
    app.run(debug=True, host='0.0.0.0', port=5000)