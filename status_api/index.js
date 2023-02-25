// express server on port 8392

const express = require('express');
const app = express();
const port = 8392;
const osu = require('node-os-utils');
// use node-os-utils and make a stats endpoint with cpu, mem, ram, disk, network and temp stats in a json format, and also a / with a simple hello world
app.get('/stats', async (req, res) => {
    // const cpu = await osu.cpu.usage();
    // const mem = await osu.mem.info();
    // const disk = await osu.drive.info();
    // const network = await osu.netstat.inOut();
    // rewrite the above to use Promise.all
    const [cpu, mem, disk, network, uptime] = await Promise.all([
        osu.cpu.usage(),
        osu.mem.info(),
        osu.drive.info(),
        osu.netstat.inOut(),
        osu.os.uptime(),
    ]);

    // console.log(cpu, mem, disk, network, uptime)
    // const temp = await osu.cpu.temperature();
    res.header("Access-Control-Allow-Origin", "*");
    res.send({
        cpu,
        mem,
        disk,
        network,
        uptime
    });
});

app.get('/', (req, res) => {
    res.send({
        message: 'Hello World!',
        status: "alive"
    });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});