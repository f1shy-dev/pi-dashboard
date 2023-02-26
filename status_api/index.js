// express server on port 8392

const express = require('express');
const app = express();
const port = 8392;
const osu = require('node-os-utils');
const { exec } = require('child_process');
const getTemp = async () => {
    // run command `vcgencmd measure_temp` with exec async
    const { stdout, stderr } = await new Promise((resolve, reject) => {
        exec('vcgencmd measure_temp', (err, stdout, stderr) => {
            if (err) return reject(err);
            resolve({ stdout, stderr });
        });
    });

    //output is like temp=32.1'C, parse to return 32.1
    return parseFloat(stdout.split('=')[1].split("'")[0]);
};


app.get('/stats', async (req, res) => {
    // const cpu = await osu.cpu.usage();
    // const mem = await osu.mem.info();
    // const disk = await osu.drive.info();
    // const network = await osu.netstat.inOut();
    // rewrite the above to use Promise.all
    const [cpu, mem, disk, network, uptime, temp] = await Promise.all([
        osu.cpu.usage(),
        osu.mem.info(),
        osu.drive.info(),
        osu.netstat.inOut(),
        osu.os.uptime(),
        getTemp()
    ]);

    // console.log(cpu, mem, disk, network, uptime)
    // const temp = await osu.cpu.temperature();
    res.header("Access-Control-Allow-Origin", "*");
    res.send({
        cpu,
        mem,
        disk,
        network,
        uptime,
        temp
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