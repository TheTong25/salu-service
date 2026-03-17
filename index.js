const app = require("./app");
const connectDB = require("./src/configs/db");

const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, () => {
    console.log("Server is running on port: http://localhost:" + PORT);
});