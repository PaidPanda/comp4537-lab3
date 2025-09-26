const math = require("./modules/math.js");
const STRINGS = require("./lang/messages/en/user.js");

// simple application class to test debugger
class App {
    run() {
        console.log(`${STRINGS.log} ${math.add(5, 10)}.`);
    }
}

const app = new App();
app.run();