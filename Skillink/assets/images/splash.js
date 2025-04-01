// This is a script to generate a proper splash screen image
// You would run this with Node.js to create the splash.png file
// For now, we're just showing the approach - you'll need to manually implement it

const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

async function generateSplashScreen() {
  // Create a canvas (1242 x 2436 is good for most devices)
  const canvas = createCanvas(1242, 2436);
  const ctx = canvas.getContext("2d");

  // Draw blue background
  ctx.fillStyle = "#3366FF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Load and draw logo
  const logo = await loadImage(path.join(__dirname, "logo.png"));

  // Center the logo
  const logoWidth = 400;
  const logoHeight = 400;
  const logoX = (canvas.width - logoWidth) / 2;
  const logoY = (canvas.height - logoHeight) / 2 - 100;

  ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

  // Add app name
  ctx.font = "bold 80px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.fillText("Skillink", canvas.width / 2, logoY + logoHeight + 100);

  // Add tagline
  ctx.font = "40px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.fillText(
    "Unlock Your Potential",
    canvas.width / 2,
    logoY + logoHeight + 170
  );

  // Save to file
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(path.join(__dirname, "splash.png"), buffer);

  console.log("Splash screen generated successfully!");
}

// To execute this script: node splash.js
// generateSplashScreen().catch(console.error);

// NOTE: This is just for illustration - in practice, you'd need to:
// 1. Install the canvas package: npm install canvas
// 2. Run this script to generate the splash.png
// 3. The splash image would be automatically used by Expo
