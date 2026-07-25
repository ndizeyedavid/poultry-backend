#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>
#include <WiFi.h>
#include <HTTPClient.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// ---- DHT11 (temp/humidity) ----
#define DHTPIN  15      // data pin -- change to match your wiring
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// ---- Gas sensor (analog output, e.g. MQ135) ----
#define MQ_PIN 34       // AOUT pin -- must be an ADC-capable GPIO on ESP32
#define FAN_PIN 2       // Output pin to drive fan relay or transistor

const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "https://poultry-backend-gmve.onrender.com/insert";
const char* controlsUrl = "https://poultry-backend-gmve.onrender.com/fetchcontrols";

float temperature;
float humidity;
int airQuality;
int fanState = 0;

void connectWiFi() {
  Serial.print("Connecting to Wi-Fi");
  WiFi.begin(ssid, password);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print('.');
    if (millis() - start > 20000) {
      Serial.println("\nFailed to connect to Wi-Fi");
      return;
    }
  }

  Serial.println();
  Serial.print("Wi-Fi connected, IP: ");
  Serial.println(WiFi.localIP());
}

bool sendSensorData(float temp, float hum, int airQ) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi not connected, skipping upload");
    return false;
  }

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  String body = "{";
  body += "\"temperature\":" + String(temp, 1) + ",";
  body += "\"humidity\":" + String(hum, 1) + ",";
  body += "\"airQuality\":" + String(airQ) + ",";
  body += "\"location\":\"esp32\"";
  body += "}";

  int httpResponseCode = http.POST(body);
  if (httpResponseCode > 0) {
    Serial.print("POST response code: ");
    Serial.println(httpResponseCode);
    String response = http.getString();
    Serial.print("Response: ");
    Serial.println(response);
  } else {
    Serial.print("Error sending POST: ");
    Serial.println(httpResponseCode);
  }

  http.end();
  return (httpResponseCode > 0 && httpResponseCode < 300);
}

void updateFanState() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi not connected, skipping fan update");
    return;
  }

  HTTPClient http;
  http.begin(controlsUrl);
  int httpCode = http.GET();

  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();
    int fanIndex = payload.indexOf("\"gpio\":\"fan\"");
    if (fanIndex >= 0) {
      int stateIndex = payload.indexOf("\"state\":", fanIndex);
      if (stateIndex >= 0) {
        int value = payload.substring(stateIndex + 8).toInt();
        fanState = value;
        digitalWrite(FAN_PIN, fanState ? HIGH : LOW);
        Serial.print("Fan state updated: ");
        Serial.println(fanState);
      }
    } else {
      Serial.println("Fan control not found in response");
    }
  } else {
    Serial.print("Fan state request failed, code: ");
    Serial.println(httpCode);
  }

  http.end();
}

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  pinMode(FAN_PIN, OUTPUT);
  digitalWrite(FAN_PIN, LOW);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED not found");
    while (true);
  }

  dht.begin();
  connectWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  updateFanState();

  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println("Failed to read from DHT sensor!");
  } else {
    temperature = t;
    humidity = h;
  }

  int raw = analogRead(MQ_PIN);
  airQuality = map(raw, 0, 4095, 0, 800);

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println(" Poultry Farm");
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);
  display.setCursor(0, 18);
  display.print("Temp : ");
  display.print(temperature);
  display.println(" C");
  display.setCursor(0, 33);
  display.print("Hum  : ");
  display.print(humidity);
  display.println(" %");
  display.setCursor(0, 48);
  display.print("AirQ : ");
  display.print(airQuality);
  display.display();

  if (!isnan(temperature) && !isnan(humidity)) {
    sendSensorData(temperature, humidity, airQuality);
  }

  delay(10000);
}
