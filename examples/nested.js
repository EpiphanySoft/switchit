const switchit = require('switchit');

class Pizza extends switchit.Command {
    execute () {
        console.log('🍕🍕🍕🍕 Aw yeah, pizza: 🍕🍕🍕🍕');
    }
}

class Sushi extends switchit.Command {
    execute () {
        console.log("🍣🍣🍣🍣 I'm in the mood for some sushi! 🍣🍣🍣🍣");
    }
}

class Order extends Container {}
Order.define({
    commands: [Pizza, Sushi]
});

new Order().run();