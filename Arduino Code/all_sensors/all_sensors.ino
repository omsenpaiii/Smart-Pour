#include <Arduino.h>
#include <WiFiNINA.h>
#include <ArduinoJson.h>
#include <Firebase_Arduino_WiFiNINA.h>

#define FIREBASE_HOST "https://light-control-b6f12-default-rtdb.asia-southeast1.firebasedatabase.app/" // Define the Firebase database URL
#define FIREBASE_AUTH "XNDueWNW3BeBXtWPPCE93UCaohnyWn5OZMs0LCVZ"   // Define the Firebase authentication token

char ssid[] = "Kartik";
char pass[] = "87654321";

FirebaseData object;
String pathPH = "/sensorData/pH";
String pathFlowRate = "/sensorData/flowRate";
String pathColor = "/sensorData/color";

// pH sensor
const int pHpin = A0;
float pHvalue = 0;

// Flow meter
const int flowPin = 2;
const float calibrationFactor = 450.0;
volatile int flowPulseCount = 0;
float flowRate = 0.0;
unsigned long oldTime;

// Color sensor
#define S0 4
#define S1 5
#define S2 6
#define S3 7
#define OUT 8

void setup() {
  Serial.begin(9600);

  // pH sensor setup remains unchanged

  // Flow meter setup
  pinMode(flowPin, INPUT);
  attachInterrupt(digitalPinToInterrupt(flowPin), countPulse, RISING);
  oldTime = millis();

  // Color sensor setup
  pinMode(S0, OUTPUT);
  pinMode(S1, OUTPUT);
  pinMode(S2, OUTPUT);
  pinMode(S3, OUTPUT);
  pinMode(OUT, INPUT_PULLUP);
  digitalWrite(S0, HIGH);
  digitalWrite(S1, LOW);
  
  // Initialize FirebaseData object
  object = FirebaseData();

  while (WiFi.begin(ssid, pass) != WL_CONNECTED) {
    Serial.print(".");
    delay(5000);
  }

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH, ssid, pass);
  Firebase.reconnectWiFi(true);
}

void loop() {
  // pH sensor
  pHvalue = readPH();
  Serial.print("pH value: ");
  Serial.println(pHvalue, 2);
  
  // Flow meter
  if ((millis() - oldTime) > 1000) {
    detachInterrupt(digitalPinToInterrupt(flowPin));
    flowRate = (flowPulseCount / calibrationFactor) * 60;
    Serial.print("Flow rate: ");
    Serial.print(flowRate, 2);
    Serial.println(" L/min");
    flowPulseCount = 0;
    oldTime = millis();
    attachInterrupt(digitalPinToInterrupt(flowPin), countPulse, RISING);
  }
  
  // Color sensor
  int red = getColorReading(S2, LOW, S3, LOW);
  int green = getColorReading(S2, HIGH, S3, HIGH);
  int blue = getColorReading(S2, LOW, S3, HIGH);
  Serial.print("Red: ");
  Serial.print(red);
  Serial.print(" Green: ");
  Serial.print(green);
  Serial.print(" Blue: ");
  Serial.println(blue);

  // Send pH value to Firebase
  Firebase.setFloat(object, pathPH, pHvalue);

  // Send flow rate to Firebase
  Firebase.setFloat(object, pathFlowRate, flowRate);

  // Send color readings to Firebase as a JSON object
  String colorData = "{\"red\":" + String(red) + ",\"green\":" + String(green) + ",\"blue\":" + String(blue) + "}";
  Firebase.setString(object, pathColor, colorData);
  
  delay(1000);
}

void countPulse() {
  flowPulseCount++;
}

float readPH() {
  float avgValue;
  int buf[10];

  for (int i = 0; i < 10; i++) {
    buf[i] = analogRead(pHpin);
    delay(10);
  }

  sortArray(buf, 10);
  avgValue = 0;
  for (int i = 2; i < 8; i++) {
    avgValue += buf[i];
  }

  float phValue = (float)avgValue * 5.0 / 1024 / 6;
  phValue = 1.5 * phValue;

  return phValue;
}

void sortArray(int *buf, int length) {
  for (int i = 0; i < length - 1; i++) {
    for (int j = i + 1; j < length; j++) {
      if (buf[i] > buf[j]) {
        int temp = buf[i];
        buf[i] = buf[j];
        buf[j] = temp;
      }
    }
  }
}

int getColorReading(int pin1, int state1, int pin2, int state2) {
  digitalWrite(pin1, state1);
  digitalWrite(pin2, state2);
  return pulseIn(OUT, digitalRead(OUT) == HIGH ? LOW : HIGH);
}