const express = require("express");
const router = express.Router();
const fs = require("fs");
var ps = require("ps-node");

const { exec, execSync, spawn, spawnSync } = require("child_process");
const { send } = require("process");

module.exports = router;

const PASSWORD = "123456";
const BALANCE = "1500000000000000000000000000";
const MICUENTA = "0x937fbAD70a9Eeb01d645399031fCA95182308800";
const IP = "127.0.0.1";

function getNumbersInString(string) {
  var tmp = string.split("");
  var map = tmp.map(function (current) {
    if (!isNaN(parseInt(current))) {
      return current;
    }
  });
  var numbers = map.filter(function (value) {
    return value != undefined;
  });
  return numbers.join("");
}

function launchNode(
  NUMERO_NETWORK,
  NUMERO_NODO,
  DIR_NODE,
  NETWORK_DIR,
  IPCPATH,
  NETWORK_CHAINID,
  HTTP_PORT,
  CUENTA,
  PORT,
  AUTHRPC_PORT,
  BALANCE,
  CUENTAS_ALLOC
) {
  const out2 = fs.openSync(`./${DIR_NODE}/outNodo.log`, "a");
  const err2 = fs.openSync(`./${DIR_NODE}/outNodo.log`, "a");
  const params = [
    "--networkid",
    NETWORK_CHAINID,
    "--mine",
    "--syncmode",
    "full",
    "--datadir",
    DIR_NODE,
    "--http.addr",
    "0.0.0.0",
    "--http",
    "--http.corsdomain",
    "*",
    "--graphql",
    "--http.port",
    HTTP_PORT,
    "--http.api",
    "clique,admin,eth,miner,net,txpool,personal,web3",
    "--allow-insecure-unlock",
    "--unlock",
    CUENTA,
    "--password",
    `${DIR_NODE}/pwd`,
    "--port",
    PORT,
    "--authrpc.port",
    AUTHRPC_PORT,
    "--ipcpath",
    IPCPATH,
    "--nodiscover",
    "--trace",
    `${DIR_NODE}/trace.txt`,
  ];

  const nodo = {
    network: NUMERO_NETWORK,
    nodo: NUMERO_NODO,
    network_dir: NETWORK_DIR,
    dir_node: DIR_NODE,
    port: PORT,
    http_port: HTTP_PORT,
    ipcpath: IPCPATH,
    address: CUENTAS_ALLOC,
    chainId: NETWORK_CHAINID,
    authRpcPort: AUTHRPC_PORT,
    prefund: BALANCE,
  };
  const subproceso2 = spawn("geth", params, {
    detached: true,
    stdio: ["ignore", out2, err2],
  });
  fs.writeFileSync(
    `${DIR_NODE}/paramsNodo.json`,
    JSON.stringify({ nodo, subproceso: subproceso2 }, null, 4)
  );
  subproceso2.unref();
  return { nodo, subproceso: subproceso2 };
}
/*geth --authrpc.port 8551 --ipcpath "\\. \pipe\geth1.ipc"--datadir nodo1 --syncmode full --http --http.api admin,eth,miner,net,txpool,personal --http.port 8545 --allow-insecure-unlock --unlock "0xf7b6a1af7743b5ece588206fd473a7223f158cd4" --password pswd.txt --port 30034 --bootnodes "enode://0b6c00d5ff74908252a0d57f86c9dac1d30eb16b1cb8396d030702ec8a9dcb45c27ec339f11918f9f71b638ed89bd91f5dfe64764354dcdc1904e9f8d744d6fd@127.0.0.1:0?discport=30310"*/
function generateParameter(network, node) {
  const NUMERO_NETWORK = parseInt(network);
  const NUMERO_NODO = parseInt(node);
  const NODO = `nodo${NUMERO_NODO}`;
  const NETWORK_DIR = `ETH/eth${NUMERO_NETWORK}`;
  const NETWORK_CHAINID = 333444 + NUMERO_NETWORK;

  const HTTP_PORT = 9545 + NUMERO_NODO + NUMERO_NETWORK * 20; // --http.port 8545
  const DIR_NODE = `${NETWORK_DIR}/${NODO}`; //--datadir nodo1
  const IPCPATH = `\\\\.\\pipe\\${NETWORK_CHAINID}-${NODO}.ipc`; //--ipcpath "\\. \pipe\geth1.ipc"
  const PORT = 30404 + NUMERO_NODO + NUMERO_NETWORK * 20; //--port 30034
  const AUTHRPC_PORT = 9553 + NUMERO_NODO + NUMERO_NETWORK * 20; //--authrpc.port 8551

  return {
    NUMERO_NETWORK,
    NUMERO_NODO,
    NODO,
    NETWORK_DIR,
    NETWORK_CHAINID,
    HTTP_PORT,
    DIR_NODE,
    IPCPATH,
    PORT,
    AUTHRPC_PORT,
  };
}

function createIfNotExists(path) {
  if (!fs.existsSync(path)) fs.mkdirSync(path);
}
function deleteIfExists(path) {
  if (fs.existsSync(path)) fs.rmSync(path, { recursive: true });
}

function createAccount(DIR_NODE) {
  fs.writeFileSync(`${DIR_NODE}/pwd`, PASSWORD);
  execSync(`geth --datadir ${DIR_NODE} account new --password ${DIR_NODE}/pwd`);

  return getAccount(DIR_NODE);
}

function getAccount(DIR_NODE) {
  // We get the address of the account we have just created
  const lista = fs.readdirSync(`${DIR_NODE}/keystore`);
  const address = JSON.parse(
    fs.readFileSync(`${DIR_NODE}/keystore/${lista[0]}`).toString()
  ).address;
  return address;
}

function getNodeData(DIR_NODE) {
  const data = JSON.parse(
    fs.readFileSync(`${DIR_NODE}/paramsNodo.json`).toString()
  ).nodo;
  return data;
}

function generateGenesis(
  NETWORK_CHAINID,
  CUENTA,
  BALANCE,
  CUENTAS_ALLOC,
  NETWORK_DIR
) {
  const timestamp = Math.round(new Date().getTime() / 1000).toString(16);
  // leemos la plantilla del genesis
  let genesis = JSON.parse(fs.readFileSync("genesisbase.json").toString());

  // genesis.timestamp = `0x${timestamp}`
  genesis.config.chainId = NETWORK_CHAINID;
  genesis.extraData = `0x${"0".repeat(64)}${CUENTA}${"0".repeat(130)}`;

  genesis.alloc = CUENTAS_ALLOC.reduce((acc, item) => {
    acc[item] = { balance: BALANCE };
    return acc;
  }, {});

  fs.writeFileSync(`${NETWORK_DIR}/genesis.json`, JSON.stringify(genesis));
}
router.post("/create", async (req, res) => {
  console.log("req.body -> " + req.body);
  const NUMERO_NETWORK = parseInt(req.body.network);
  // if NUMERO_NETWORK is empty then return error with a json
  if (!NUMERO_NETWORK) {
    res.status(400).json({ error: "Network is required" });
    return;
  }
  const NUMERO_CUENTA = req.body.cuenta;
  // if NUMERO_CUENTA is empty then return error with a json
  if (!NUMERO_CUENTA) {
    res.status(400).json({ error: "Account is required" });
    return;
  }
  const NUMERO_NODO = 1;
  // Generate parameters with the network and node number
  const parametros = generateParameter(NUMERO_NETWORK, NUMERO_NODO);

  const {
    NETWORK_DIR,
    DIR_NODE,
    NETWORK_CHAINID,
    AUTHRPC_PORT,
    HTTP_PORT,
    PORT,
    IPCPATH,
  } = parametros;

  createIfNotExists("ETH");
  deleteIfExists(NETWORK_DIR);
  createIfNotExists(NETWORK_DIR);
  createIfNotExists(DIR_NODE);

  const CUENTA = createAccount(DIR_NODE);
  console.log("CUENTA -> " + CUENTA);
  const CUENTAS_ALLOC = [CUENTA, NUMERO_CUENTA];
  console.log("CUENTAS_ALLOC -> " + CUENTAS_ALLOC);

  generateGenesis(NETWORK_CHAINID, CUENTA, BALANCE, CUENTAS_ALLOC, NETWORK_DIR);

  // INICIALIZAMOS EL NODO
  const comando = `geth --datadir ${DIR_NODE} init ${NETWORK_DIR}/genesis.json`;
  console.log("comando -> " + comando);
  const result = init_node_from_genesis(comando);
  const resultado = launchNode(
    NUMERO_NETWORK,
    NUMERO_NODO,
    DIR_NODE,
    NETWORK_DIR,
    IPCPATH,
    NETWORK_CHAINID,
    HTTP_PORT,
    CUENTA,
    PORT,
    AUTHRPC_PORT,
    BALANCE,
    CUENTAS_ALLOC
  );

  res.send(resultado);
});

async function init_node_from_genesis(comando) {
  const result = exec(comando, (error, stdout, stderr) => {
    console.log("ejecutado");
    if (error) {
      res.send({ error });
      return;
    }
  });
}

router.post("/create/:network/:node", (req, res) => {
  const NUMERO_NETWORK = parseInt(getNumbersInString(req.params.network));
  const NUMERO_NODO = parseInt(getNumbersInString(req.params.node));
  const parametros = generateParameter(NUMERO_NETWORK, NUMERO_NODO);

  const {
    NETWORK_DIR,
    DIR_NODE,
    NETWORK_CHAINID,
    AUTHRPC_PORT,
    HTTP_PORT,
    PORT,
    IPCPATH,
  } = parametros;

  createIfNotExists("ETH");
  deleteIfExists(NETWORK_DIR);
  createIfNotExists(NETWORK_DIR);
  createIfNotExists(DIR_NODE);

  const CUENTA = createAccount(DIR_NODE);
  const CUENTAS_ALLOC = [CUENTA, MICUENTA];

  generateGenesis(NETWORK_CHAINID, CUENTA, BALANCE, CUENTAS_ALLOC, NETWORK_DIR);

  // INICIALIZAMOS EL NODO
  const comando = `geth --datadir ${DIR_NODE} init ${NETWORK_DIR}/genesis.json`;

  const result = exec(comando, (error, stdout, stderr) => {
    console.log("ejecutado");
    if (error) {
      res.send({ error });
      return;
    }
    const resultado = launchNode(
      NUMERO_NETWORK,
      NUMERO_NODO,
      DIR_NODE,
      NETWORK_DIR,
      IPCPATH,
      NETWORK_CHAINID,
      HTTP_PORT,
      CUENTA,
      PORT,
      AUTHRPC_PORT,
      BALANCE,
      CUENTAS_ALLOC
    );

    res.send(resultado);
  });
});

router.post("/add/:network/:node", (req, res) => {
  const NUMERO_NETWORK = parseInt(req.params.network);
  const NUMERO_NODO = parseInt(req.params.node);
  const parametros = generateParameter(NUMERO_NETWORK, NUMERO_NODO);

  const {
    NETWORK_DIR,
    DIR_NODE,
    NETWORK_CHAINID,
    AUTHRPC_PORT,
    HTTP_PORT,
    PORT,
    IPCPATH,
  } = parametros;

  deleteIfExists(DIR_NODE);
  createIfNotExists(DIR_NODE);

  const CUENTA = createAccount(DIR_NODE);
  const CUENTAS_ALLOC = [CUENTA];

  const comando = `geth --datadir ${DIR_NODE} init ${NETWORK_DIR}/genesis.json`;

  const result = exec(comando, (error, stdout, stderr) => {
    console.log("ejecutado");
    if (error) {
      res.send({ error });
      return;
    }
    const resultado = launchNode(
      NUMERO_NETWORK,
      NUMERO_NODO,
      DIR_NODE,
      NETWORK_DIR,
      IPCPATH,
      NETWORK_CHAINID,
      HTTP_PORT,
      CUENTA,
      PORT,
      AUTHRPC_PORT,
      BALANCE,
      CUENTAS_ALLOC
    );
    res.send(resultado);
  });
});

router.delete("/:network", (req, res) => {
  const NETWORK = req.params.network;
  const NETWORK_DIR = `ETH/${NETWORK}`;
  const nodos = fs
    .readdirSync(NETWORK_DIR, { withFileTypes: true })
    .filter((i) => !i.isFile());
  const pids = nodos.map((i) => {
    try {
      return JSON.parse(
        fs.readFileSync(`${NETWORK_DIR}/${i.name}/paramsNodo.json`)
      ).subproceso.pid;
    } catch (error) {
      console.log(error);
      return null;
    }
  });

  pids
    .filter((i) => i != null)
    .forEach((i) => {
      try {
        process.kill(i);
      } catch (error) {
        console.log(error);
      }
    });

  fs.rmSync(NETWORK_DIR, { recursive: true });
  res.send({ network: req.params.network });
});

router.post("/reload/:network", (req, res) => {
  const NUMERO_NETWORK = parseInt(req.params.network);
  const NETWORK_DIR = `ETH/eth${NUMERO_NETWORK}`;
  console.log("intenta reload");
  // los directorios
  const nodos = fs
    .readdirSync(NETWORK_DIR, { withFileTypes: true })
    .filter((i) => !i.isFile());
  // los datos de los nodos
  const data = nodos.map((i) =>
    JSON.parse(fs.readFileSync(`${NETWORK_DIR}/${i.name}/paramsNodo.json`))
  );
  // matamos los los procesos
  const pids = data.map((i) => i.subproceso.pid);

  pids.forEach((i) => {
    try {
      process.kill(i);
    } catch (error) {}
  });
  // generamos static-nodes.json
  const output = nodos.map((i) =>
    JSON.parse(fs.readFileSync(`${NETWORK_DIR}/${i.name}/paramsNodo.json`))
  );
  const puertos = output.map((i) => ({ port: i.nodo.http_port }));

  const keynode = output.map((i) => ({
    nodekey: fs.readFileSync(`${i.nodo.dir_node}/geth/nodekey`).toString(),
    port: i.nodo.port,
  }));
  const enodes = keynode.map(
    (i) =>
      `enode://${spawnSync}("bootnode", [
        "-nodekeyhex",
        i.nodekey,
        "-writeaddress",
      ])
        .stdout.toString()
        .trimEnd()}@127.0.0.1:${i.port}?discport=0`
  );
  output.forEach((i) => {
    fs.writeFileSync(
      `${i.nodo.dir_node}/static-nodes.json`,
      JSON.stringify(enodes)
    );
  });
  // lanzamos
  data.forEach((i) => {
    try {
      const out2 = fs.openSync(`./${i.nodo.dir_node}/outNodo.log`, "w");
      const err2 = fs.openSync(`./${i.nodo.dir_node}/outNodo.log`, "a");
      const subproceso2 = spawn(
        "geth",
        i.subproceso.spawnargs.filter((i, index) => index > 0),
        {
          detached: true,
          stdio: ["ignore", out2, err2],
        }
      );
      subproceso2.unref();
      fs.writeFileSync(
        `${i.nodo.dir_node}/paramsNodo.json`,
        JSON.stringify(
          { date: new Date(), nodo: i.nodo, subproceso: subproceso2 },
          null,
          4
        )
      );
    } catch (error) {
      console.log(error);
    }
  });

  res.send({ network: req.params.network });
});

router.get("/procesos/:network", async (req, res) => {
  const NUMERO_NETWORK = parseInt(req.params.network);
  const NETWORK_DIR = `ETH/eth${NUMERO_NETWORK}`;
  const nodos = fs
    .readdirSync(NETWORK_DIR, { withFileTypes: true })
    .filter((i) => !i.isFile());
  const output = nodos.map((i) =>
    JSON.parse(fs.readFileSync(`${NETWORK_DIR}/${i.name}/paramsNodo.json`))
  );
  res.send(output);
});

router.get("/", async (req, res) => {
  createIfNotExists("ETH");
  const redes = fs
    .readdirSync("ETH", { withFileTypes: true })
    .filter((i) => !i.isFile());
  const output = redes
    .map((i) => {
      if (!fs.existsSync(`ETH/${i.name}/genesis.json`)) return null;
      const genesis = JSON.parse(fs.readFileSync(`ETH/${i.name}/genesis.json`));
      const cuentas = Object.keys(genesis.alloc);
      const nodes = fs
        .readdirSync(`ETH/${i.name}`, { withFileTypes: true })
        .filter((j) => !j.isFile());

      return {
        numero: i.name,
        chainid: genesis.config.chainId,
        cuentas: cuentas,
        nodes: nodes,
      };
    })
    .filter((i) => i != null);
  res.send(output);
});

router.post("/status/:network/:node", (req, res) => {
  const NUMERO_NETWORK = parseInt(req.params.network);
  const NUMERO_NODO = parseInt(req.params.node);
  const parametros = generateParameter(NUMERO_NETWORK, NUMERO_NODO);

  const {
    NETWORK_DIR,
    DIR_NODE,
    NETWORK_CHAINID,
    AUTHRPC_PORT,
    HTTP_PORT,
    PORT,
    IPCPATH,
  } = parametros;

  //const comando = `curl --data '{"jsonrpc":"2.0","method":"net_listening", "params": [], "id":2}' -H "Content-Type: application/json" localhost:8545`;
  const comando =
    'geth attach --exec "net.listening" http://localhost:' + HTTP_PORT;
  const resultado = exec(comando, (error, stdout, stderr) => {
    console.log("ejecutado");
    if (error) {
      res.send({ error });
      return;
    }
    console.log("RESULTADO");

    console.log({ Salida: stdout });
    res.send({ Salida: stdout });
  });
});

router.post("/start/:network/:node", async (req, res) => {
  const NUMERO_NETWORK = parseInt(req.params.network);
  const NUMERO_NODO = parseInt(req.params.node);

  const NETWORK_DIR = `ETH/eth${NUMERO_NETWORK}`;
  const DIR_NODE = `${NETWORK_DIR}/nodo${NUMERO_NODO}`;
  const address = getAccount(DIR_NODE);
  const nodeData = getNodeData(DIR_NODE);

  console.log(nodeData.chainId);

  // Fiile the params array with the command line arguments
  const params = [
    "--networkid",
    nodeData.chainId,
    "--syncmode",
    "full",
    "--nat",
    `extip:${IP}`,
    "--datadir",
    DIR_NODE,
    "--port",
    nodeData.port,
    "--unlock",
    `0x${address}`,
    "--password",
    "pwd.txt",
    "--authrpc.port",
    nodeData.authRpcPort,
    "--http.api",
    "admin,eth,net,txpool,personal,web3,clique",
    "--allow-insecure-unlock",
    "--http",
    "--graphql",
    "--http.port",
    nodeData.http_port,
    "--mine",
    "--miner.threads",
    "2",
    "--miner.etherbase",
    address,
  ];

  // Exxecute the command as a subprocess
  const out = fs.openSync(`./${DIR_NODE}/outNodo.log`, "w");
  const err = fs.openSync(`./${DIR_NODE}/outNodo.log`, "a");
  const subprocess = spawn("geth", params, {
    detached: true,
    stdio: ["ignore", out, err],
  });

  fs.writeFileSync(
    `${DIR_NODE}/paramsNodoRunning.json`,
    JSON.stringify({ subproceso: subprocess }, null, 4)
  );

  res.send(subprocess);
});

router.post("/stop/:network/:node", async (req, res) => {
  const NUMERO_NETWORK = parseInt(req.params.network);
  const NUMERO_NODO = parseInt(req.params.node);

  const NETWORK_DIR = `ETH/eth${NUMERO_NETWORK}`;
  const DIR_NODE = `${NETWORK_DIR}/nodo${NUMERO_NODO}`;

  console.log("DIR_NODE");
  console.log(DIR_NODE);

  // const params = fs.readdirSync(`${DIR_NODE}/paramsNodoRunning.json`);
  var params = fs.readFileSync(`${DIR_NODE}/paramsNodoRunning.json`).toString();

  // Convert to JSON
  params = JSON.parse(params);

  const result_kill = await ps.kill(params.subproceso.pid, function (err) {
    if (err) {
      throw new Error(err);
    } else {
      console.log("Process %s has been killed!", params.subproceso.pid);
    }
  });

  res.send({ result: result_kill });
});
router.post("/lastblock/:network/:node", (req, res) => {
  const NUMERO_NETWORK = parseInt(getNumbersInString(req.params.network));
  const NUMERO_NODO = parseInt(getNumbersInString(req.params.node));

  const parametros = generateParameter(NUMERO_NETWORK, NUMERO_NODO);

  const {
    NETWORK_DIR,
    DIR_NODE,
    NETWORK_CHAINID,
    AUTHRPC_PORT,
    HTTP_PORT,
    PORT,
    IPCPATH,
  } = parametros;

  // // geth attach --exec "eth.blockNumber// eth.getBlock(0).hash // eth.getBlockByNumber(0)" http://localhost:
  const comando =
    'geth attach --exec "eth.blockNumber" http://localhost:' + HTTP_PORT;
  const resultado = exec(comando, (error, stdout, stderr) => {
    console.log("ejecutado");
    if (error) {
      console.log({ error });
      return;
    }
    
    //console.log(resultado);
    console.log("RESULTADO");

    console.log({ Salida: stdout });
    console.log(HTTP_PORT);
    res.send({ Salida: stdout });
  });
});
router.post("/block/:network/:node/:block", (req, res) => {
  const NUMERO_NETWORK = parseInt(getNumbersInString(req.params.network));
  const NUMERO_NODO = parseInt(getNumbersInString(req.params.node));
  const NUMERO_BLOCK = parseInt(getNumbersInString(req.params.block));
  const parametros = generateParameter(NUMERO_NETWORK, NUMERO_NODO);

  const {
    NETWORK_DIR,
    DIR_NODE,
    NETWORK_CHAINID,
    AUTHRPC_PORT,
    HTTP_PORT,
    PORT,
    IPCPATH,
  } = parametros;

  // // geth attach --exec "eth.blockNumber// eth.getBlock(0).hash // eth.getBlockByNumber(0)" http://localhost:
  const comando =
    'geth attach --exec "eth.getBlockByNumber('+NUMERO_BLOCK+')" http://localhost:' + HTTP_PORT;
  const resultado = exec(comando, (error, stdout, stderr) => {
    console.log("ejecutado");
    if (error) {
      console.log({ error });
      return;
    }
    
    //console.log(resultado);
    console.log("RESULTADO");

    console.log({ Salida: stdout });
   
    res.send({stdout});
  });
});
router.post("/blocktx/:network/:node/:tx", (req, res) => {
  const NUMERO_NETWORK = parseInt(getNumbersInString(req.params.network));
  const NUMERO_NODO = parseInt(getNumbersInString(req.params.node));
  const HASHTX = req.params.tx;
  const parametros = generateParameter(NUMERO_NETWORK, NUMERO_NODO);

  const {
    NETWORK_DIR,
    DIR_NODE,
    NETWORK_CHAINID,
    AUTHRPC_PORT,
    HTTP_PORT,
    PORT,
    IPCPATH,
  } = parametros;

  // // geth attach --exec "eth.blockNumber// eth.getBlock(0).hash // eth.getBlockByNumber(0)" http://localhost:
  const comando =
    'geth attach --exec "eth.getTransactionByHash('+HASHTX+')" http://localhost:' + HTTP_PORT;
  const resultado = exec(comando, (error, stdout, stderr) => {
    console.log("ejecutado");
    if (error) {
      console.log({ error });
      return;
    }
    
    //console.log(resultado);
    console.log("RESULTADO");

    console.log({ Salida: stdout });
   
    res.send({stdout});
  });
});
