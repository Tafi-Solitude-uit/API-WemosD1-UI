#include <ESP8266WiFi.h>
#include <DHT.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

#define DHTPIN D4
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

// Thông tin WiFi
const char* ssid = "UiTiOt-E3.1";
const char* password = "UiTiOtAP";

// URL API Server
const char* serverURL = "http://172.31.9.235:5000/data"; // Thay bằng IP của laptop bạn thay vì localhost

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("Connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  dht.begin(); // Khởi tạo cảm biến DHT
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
    
    // Sử dụng cú pháp mới cho begin() với WiFiClient
    http.begin(client, serverURL);
    http.addHeader("Content-Type", "application/json");

    // Đọc dữ liệu từ cảm biến
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    int airQuality = analogRead(A0); // Dữ liệu từ MQ-135

    // Kiểm tra nếu dữ liệu hợp lệ
    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("Failed to read from DHT sensor!");
    } else {
      // JSON payload
      String jsonPayload = "{\"temperature\":" + String(temperature) + 
                           ",\"humidity\":" + String(humidity) + 
                           ",\"airQuality\":" + String(airQuality) + "}";

      Serial.println("Sending data: " + jsonPayload);
      
      // Gửi HTTP POST
      int httpResponseCode = http.POST(jsonPayload);
      if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.print("HTTP Response code: ");
        Serial.println(httpResponseCode);
        Serial.println("Response: " + response);
      } else {
        Serial.print("Error sending data. Error code: ");
        Serial.println(httpResponseCode);
      }
    }
    
    http.end();
  }
  delay(10000); // Gửi dữ liệu mỗi 10 giây
}