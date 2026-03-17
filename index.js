const app = require("./app");
const connectDB = require("./src/configs/db");

connectDB();

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on port: http://localhost:" + (process.env.PORT || 3000));
});