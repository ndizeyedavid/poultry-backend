#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>
#include <WiFi.h>
#include <HTTPClient.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

#define DHTPIN 15
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

#define MQ_PIN 34
#define FAN_PIN 19       // Physical GPIO 19 — Fan relay
#define HEATER_PIN 14    // Physical GPIO 14 — Red LED / Heater indicator

// ========== WiFi & Backend ==========
const char* ssid       = "YOUR_WIFI_SSID";
const char* password   = "YOUR_WIFI_PASSWORD";
const char* serverUrl  = "https://poultry-backend-gmve.onrender.com/insert";
const char* controlsUrl = "https://poultry-backend-gmve.onrender.com/fetchcontrols";

// ========== Global State ==========
float temperature = 0;
float humidity = 0;
int airQuality = 0;
bool fan = false;            // desired fan state (from backend)
bool heaterOn = false;       // desired heater/LED state (from backend)

unsigned long previousMillis = 0;
const long sensorInterval = 2000;        // read sensors + auto-control every 2 s
unsigned long lastControlCheck = 0;
const long controlInterval = 5000;       // poll backend controls every 5 s
unsigned long lastSensorUpload = 0;
const long uploadInterval = 10000;       // send data to backend every 10 s

// ========== WiFi ==========
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

// ========== Backend: Post sensor data ==========
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
    Serial.print("Sensor data posted, response: ");
    Serial.println(httpResponseCode);
    String response = http.getString();
    Serial.print("Response: ");
    Serial.println(response);
  } else {
    Serial.print("Error posting sensor data: ");
    Serial.println(httpResponseCode);
  }

  http.end();
  return (httpResponseCode > 0 && httpResponseCode < 300);
}

// ========== Backend: Fetch controls ==========
// Find the state of a GPIO from the JSON response by its physical pin number.
// Returns the state (0 or 1), or -1 if not found.
int getGpioState(const String& payload, const char* gpioNum) {
  String searchStr = "\"gpio\":\"";
  searchStr += gpioNum;
  searchStr += "\"";

  int gpioIndex = payload.indexOf(searchStr);
  if (gpioIndex < 0) return -1;

  int stateIndex = payload.indexOf("\"state\":", gpioIndex);
  if (stateIndex < 0) return -1;

  // Grab the digit(s) right after "state":
  String val = payload.substring(stateIndex + 8);
  val.trim();
  return val.toInt();
}

void updateControls() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi not connected, skipping control update");
    return;
  }

  HTTPClient http;
  http.begin(controlsUrl);
  int httpCode = http.GET();

  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();

    // Fan state — GPIO 19
    int fState = getGpioState(payload, "19");
    if (fState >= 0) {
      fan = (fState == 1);
      digitalWrite(FAN_PIN, fState ? HIGH : LOW);
      Serial.print("Fan (GPIO19) state: ");
      Serial.println(fan ? "ON" : "OFF");
    }

    // Heater/LED state — GPIO 14
    int hState = getGpioState(payload, "14");
    if (hState >= 0) {
      heaterOn = (hState == 1);
      digitalWrite(HEATER_PIN, hState ? HIGH : LOW);
      Serial.print("Heater/LED (GPIO14) state: ");
      Serial.println(heaterOn ? "ON" : "OFF");
    }

    // Prevent fan and heater from being ON together (manual safeguard)
    if (fan && heaterOn) {
      heaterOn = false;
      digitalWrite(HEATER_PIN, LOW);
      Serial.println("Safety: turned heater OFF because fan is ON");
    }
  } else {
    Serial.print("Controls request failed, code: ");
    Serial.println(httpCode);
  }

  http.end();
}

// ========== Sensors + Auto Temperature Control ==========
void readSensors() {
  // --- Read DHT11 ---
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (!isnan(t)) temperature = t;
  if (!isnan(h)) humidity = h;

  // --- Read MQ gas sensor ---
  int raw = analogRead(MQ_PIN);
  airQuality = map(raw, 0, 4095, 0, 800);

  // ==========================
  // Automatic Temperature Control
  // ==========================

  if (temperature > 34) {
    // High temperature — fan ON, heater OFF
    fan = true;
    heaterOn = false;
    digitalWrite(FAN_PIN, HIGH);
    digitalWrite(HEATER_PIN, LOW);
  }
  else if (temperature < 30) {
    // Low temperature — fan OFF, heater ON
    fan = false;
    heaterOn = true;
    digitalWrite(FAN_PIN, LOW);
    digitalWrite(HEATER_PIN, HIGH);
  }
  else {
    // Normal temperature — both OFF
    fan = false;
    heaterOn = false;
    digitalWrite(FAN_PIN, LOW);
    digitalWrite(HEATER_PIN, LOW);
  }
}

// ========== OLED Display ==========
void updateDisplay() {
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

  display.setCursor(0, 30);
  display.print("Hum  : ");
  display.print(humidity);
  display.println(" %");

  display.setCursor(0, 42);
  display.print("AirQ : ");
  display.print(airQuality);

  display.setCursor(0, 54);
  display.print("Fan:");
  display.print(fan ? "ON" : "OFF");

  display.setCursor(65, 54);
  display.print("Heat:");
  display.print(heaterOn ? "ON" : "OFF");

  display.display();
}

// ========== Setup ==========
void setup() {
  Serial.begin(115200);

  Wire.begin(21, 22);

  pinMode(FAN_PIN, OUTPUT);
  pinMode(HEATER_PIN, OUTPUT);

  digitalWrite(FAN_PIN, LOW);
  digitalWrite(HEATER_PIN, LOW);

  dht.begin();

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED allocation failed");
    while (true);
  }

  display.clearDisplay();
  display.display();

  connectWiFi();
}

// ========== Main Loop ==========
void loop() {
  unsigned long currentMillis = millis();

  // --- Reconnect WiFi if needed ---
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  // --- Poll backend controls every 5 s ---
  if (currentMillis - lastControlCheck >= controlInterval) {
    lastControlCheck = currentMillis;
    updateControls();
  }

  // --- Read sensors and auto-control every 2 s ---
  if (currentMillis - previousMillis >= sensorInterval) {
    previousMillis = currentMillis;

    readSensors();
    updateDisplay();

    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.print(" C");

    Serial.print(" | Humidity: ");
    Serial.print(humidity);
    Serial.print(" %");

    Serial.print(" | Air Quality: ");
    Serial.print(airQuality);

    Serial.print(" | Fan: ");
    Serial.print(fan ? "ON" : "OFF");

    Serial.print(" | Heater: ");
    Serial.println(heaterOn ? "ON" : "OFF");
  }

  // --- Upload sensor data every 10 s ---
  if (currentMillis - lastSensorUpload >= uploadInterval) {
    lastSensorUpload = currentMillis;
    if (!isnan(temperature) && !isnan(humidity)) {
      sendSensorData(temperature, humidity, airQuality);
    }
  }
}
