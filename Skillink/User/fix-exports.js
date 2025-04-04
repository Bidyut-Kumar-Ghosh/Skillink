// Fix missing default exports in component files
const fs = require("fs");
const path = require("path");

const filesToFix = [
  "app/components/Dashboard.tsx",
  "app/components/NotificationHandler.tsx",
  "app/components/ProtectedRoute.js",
  "app/authentication/forgot-password.js",
  "app/authentication/login.js",
  "app/authentication/signup.js",
  "app/index.js",
  "app/profile/Profile.js",
  "app/profile/index.js",
  "app/settings.tsx",
  "app/change-password.tsx",
];

filesToFix.forEach((filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, "utf8");

    // Check if default export already exists
    if (content.includes("export default ")) {
      console.log(`File already has default export: ${filePath}`);
      return;
    }

    // Extract the component/function name
    let componentName = "";

    // Try to match a React component/function definition
    const functionMatches = content.match(/function\s+([A-Za-z0-9_]+)/);
    const constMatches = content.match(
      /const\s+([A-Za-z0-9_]+)\s*=\s*\(?(?:React\.)?(?:memo\()?(?:[{(]|function)/
    );

    if (functionMatches) {
      componentName = functionMatches[1];
    } else if (constMatches) {
      componentName = constMatches[1];
    } else {
      // Try to extract from filename if no component name found
      componentName = path.basename(filePath).split(".")[0];

      // Handle index files
      if (componentName === "index") {
        const parentDir = path.dirname(filePath).split("/").pop();
        componentName =
          parentDir.charAt(0).toUpperCase() + parentDir.slice(1) + "Page";
      }
    }

    if (!componentName) {
      console.log(`Could not determine component name for: ${filePath}`);
      return;
    }

    // Add export default statement at the end of the file
    const updatedContent = content + `\n\nexport default ${componentName};\n`;

    fs.writeFileSync(filePath, updatedContent, "utf8");
    console.log(`Added default export for ${componentName} in ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
});

console.log("Finished adding default exports to components");
