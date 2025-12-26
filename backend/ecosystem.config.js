module.exports = {
    apps: [{
        name: "lawbix-backend",
        script: "./app.js",
        env_production: {
            NODE_ENV: "production",
            PORT: 3001
        }
    }]
}
