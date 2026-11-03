import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// В ES-модулях нет __dirname, поэтому вычисляем путь так:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "src/data/russia.json");
const rawData = fs.readFileSync(filePath, "utf8");
const geoJson = JSON.parse(rawData);

// Функция для "разворота" координат
function unwrapRing(ring) {
  return ring.map(([lng, lat]) => {
    // Если долгота отрицательная, это Чукотка/Курилы.
    // Добавляем 360, чтобы карта не разрывала Россию.
    if (lng < 0) {
      return [lng + 360, lat];
    }
    return [lng, lat];
  });
}
// Проходим по всем полигонам и мультиполигонам
geoJson.features.forEach((feature) => {
  const geometry = feature.geometry;
  if (geometry.type === "Polygon") {
    geometry.coordinates = geometry.coordinates.map(unwrapRing);
  } else if (geometry.type === "MultiPolygon") {
    geometry.coordinates = geometry.coordinates.map((polygon) =>
      polygon.map(unwrapRing),
    );
  }
});

// Сохраняем исправленный JSON
fs.writeFileSync(filePath, JSON.stringify(geoJson, null, 2));
console.log("GeoJSON успешно исправлен!");
