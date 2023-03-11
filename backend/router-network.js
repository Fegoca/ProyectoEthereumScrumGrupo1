const express = require("express");
const router = express.Router();
const fs = require("fs");
var ps = require("ps-node");
const Web3 = require("web3");

const { exec, execSync, spawn, spawnSync } = require("child_process");
const { send } = require("process");

module.exports = router;

const PASSWORD = "123456";
const BALANCE = "1500000000000000000000000000";
const MICUENTA = "937fbAD70a9Eeb01d645399031fCA95182308800";
const IP = "127.0.0.1";
const NODE_URL = `http://localhost`;

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

function generateParameter(network, node) {
  const NUMERO_NETWORK = parseInt(network);
  const NUMERO_NODO = parseInt(node);
  const NODO = `nodo${NUMERO_NODO}`;
  const NETWORK_DIR = `ETH/eth${NUMERO_NETWORK}`;
  const NETWORK_CHAINID = 333444 + NUMERO_NETWORK;
  const BOOTNODE_PORT = 30305 + NUMERO_NETWORK;

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
    BOOTNODE_PORT,
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
  /* execSync(
    `docker run --rm -it -v ${DIR_NODE}/keystore:/data -v ${DIR_NODE}:/tmp ethereum/client-go account new --keystore /data --password /tmp/pwd`
  ); */

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

async function generateGenesis(
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
    acc[`0x${item}`] = { balance: BALANCE };
    return acc;
  }, {});
  console.log("CUENTAS_ALLOC");
  console.log(CUENTAS_ALLOC);
  console.log("genesis");
  console.log(genesis);
  console.log("BEFORE writeFileSync generateGenesis");
  await fs.writeFileSync(
    `${NETWORK_DIR}/genesis.json`,
    JSON.stringify(genesis)
  );
  console.log("AFTER writeFileSync generateGenesis");
}
router.post("/create", async (req, res) => {
  //console.log("req.body -> " + req.body);
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
    BOOTNODE_PORT,
  } = parametros;

  createIfNotExists("ETH");
  deleteIfExists(NETWORK_DIR);
  createIfNotExists(NETWORK_DIR);

  createIfNotExists(DIR_NODE);
  createIfNotExists(DIR_NODE + "/keystore");
  createIfNotExists(DIR_NODE + "/geth");

  // Create password file DIR_NODE the DIR_NODE
  fs.writeFileSync(`${DIR_NODE}/pwd`, PASSWORD);

  const CUENTA = createAccount(DIR_NODE);
  console.log("CUENTA -> " + CUENTA);
  const CUENTAS_ALLOC = [CUENTA, MICUENTA];
  console.log("CUENTAS_ALLOC -> " + CUENTAS_ALLOC);

  await generateGenesis(
    NETWORK_CHAINID,
    CUENTA,
    BALANCE,
    CUENTAS_ALLOC,
    NETWORK_DIR
  );

  // INICIALIZAMOS EL NODO
  const result = await init_node_from_genesis(NETWORK_DIR, DIR_NODE);

  res.send(result);
});

async function init_node_from_genesis(NETWORK_DIR, DIR_NODE) {
  console.log("init_node_from_genesis");
  /* const comando = `geth --datadir ${DIR_NODE} init ${NETWORK_DIR}/genesis.json`;
  console.log("comando");
  console.log(comando); */

  // Check if genesis.json exists in the network directory
  if (!fs.existsSync(`${NETWORK_DIR}/genesis.json`)) {
    console.log("genesis.json does not exist");
  } else {
    console.log("genesis.json exists");
  }

  // Fiile the params array with the command line arguments
  const params = ["--datadir", DIR_NODE, "init", `${NETWORK_DIR}/genesis.json`];

  try {
    // Exxecute the command as a subprocess
    const out = fs.openSync(`./${DIR_NODE}/initNodeGenesis.log`, "w");
    const err = fs.openSync(`./${DIR_NODE}/initNodeGenesis.log`, "a");
    const subprocess = spawn("geth", params, {
      detached: true,
      stdio: ["ignore", out, err],
    });
    console.log("out");
    console.log(out);
    console.log("err");
    console.log(err);
  } catch (error) {
    console.log("START NODE error");
    console.log(error);
  }

  /* const result = await exec(comando, (error, stdout, stderr) => {
    console.log("stdout");
    console.log(stdout);
    console.log("stderr");
    console.log(stderr);
    fs.writeFileSync(
      `${DIR_NODE}/initNodeGenesis.log`,
      "stdout /n" + stdout + "/n stderr /n" + stderr
    );
    if (error) {
      console.log("Error in init node ");
      console.log(error);
      return error;
    }
    return;
  });
  console.log("result");
  console.log(result); */
}

router.post("/create/:network/:node", async (req, res) => {
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

  console.log("BEFORE generateGenesis");
  await generateGenesis(
    NETWORK_CHAINID,
    CUENTA,
    BALANCE,
    CUENTAS_ALLOC,
    NETWORK_DIR
  );

  console.log("AFTER generateGenesis");
  // INICIALIZAMOS EL NODO
  const result = await init_node_from_genesis(NETWORK_DIR, DIR_NODE);

  res.send(result);
});

router.post("/add/:network/:node", async (req, res) => {
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
  const CUENTAS_ALLOC = [CUENTA, MICUENTA];

  if (NUMERO_NODO === 1) {
    console.log("2 BEFORE generateGenesis");
    await generateGenesis(
      NETWORK_CHAINID,
      CUENTA,
      BALANCE,
      CUENTAS_ALLOC,
      NETWORK_DIR
    );
    console.log("2 AFTER generateGenesis");
  }
  console.log("2 BEFORE init_node_from_genesis");
  const result = await init_node_from_genesis(NETWORK_DIR, DIR_NODE);

  setTimeout(() => {
    res.send({ result: "ok" });
  }, 1000);
});

router.delete("/net/:network", (req, res) => {
  const NETWORK = req.params.network;
  const NETWORK_DIR = `ETH/eth${NETWORK}`;

  // killPidifExist(NETWORK_DIR);

  const nodos = fs
    .readdirSync(NETWORK_DIR, { withFileTypes: true })
    .filter((i) => !i.isFile());
  const pids = nodos.map((i) => {
    try {
      return JSON.parse(
        fs.readFileSync(`${NETWORK_DIR}/${i.name}/paramsNodoRunning.json`)
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

  deleteIfExists(NETWORK_DIR);
  res.send({ result: "ok" });
});

router.delete("/node/:network/:node", (req, res) => {
  const NUMERO_NETWORK = parseInt(req.params.network);
  const NUMERO_NODO = parseInt(req.params.node);

  const NETWORK_DIR = `ETH/eth${NUMERO_NETWORK}`;
  const DIR_NODE = `${NETWORK_DIR}/nodo${NUMERO_NODO}`;

  stopNode(DIR_NODE);
  deleteIfExists(DIR_NODE);

  res.send({ result: "ok" });
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

      // loop the nodes
      for (let index = 0; index < nodes.length; index++) {
        const node = nodes[index];
        const parametros = generateParameter(
          getNumbersInString(i.name),
          index + 1
        );

        const { HTTP_PORT } = parametros;
        node.http_port = HTTP_PORT;
      }

      return {
        numero: i.name,
        chainid: genesis.config.chainId,
        cuentas: cuentas,
        nodes: nodes,
        bootnode: "",
      };
    })
    .filter((i) => i != null);

  // loop the output and check the bootnode status
  for (let network_index = 0; network_index < output.length; network_index++) {
    const network = output[network_index];
    network.bootnode = "down";

    var paramsBootnodeFile = `ETH/${network.numero}/paramsBootnode.json`;
    console.log(paramsBootnodeFile);
    if (fs.existsSync(paramsBootnodeFile)) {
      var params = fs.readFileSync(paramsBootnodeFile).toString();

      // Convert to JSON
      params = JSON.parse(params);
      network.bootnode = await checkPidStatus(params.subproceso.pid);
    }

    // loop the nodes and check the status
    for (let node_index = 0; node_index < network.nodes.length; node_index++) {
      const node = network.nodes[node_index];
      node.status = await checkNodeStatus(network_index + 1, node_index + 1);
      console.log("node.status **************");
      console.log(node.status);
      //node.status = await checkPidStatus(node.subproceso.pid);
    }
  }
  console.log("output **************");
  console.log(output);
  res.send(output);
});

async function checkPidStatus(pid) {
  await ps.lookup({ pid: pid }, function (err, resultList) {
    if (err) {
      throw new Error(err);
    }
    var process = resultList[0];

    if (process) {
      console.log(
        "PID: %s, COMMAND: %s, ARGUMENTS: %s",
        process.pid,
        process.command,
        process.arguments
      );
      return "up";
    } else {
      console.log("No such process found!");
      return "down";
    }
  });
}

async function checkNodeStatus(NUMERO_NETWORK, NUMERO_NODO) {
  const parametros = generateParameter(NUMERO_NETWORK, NUMERO_NODO);
  const { HTTP_PORT } = parametros;

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    method: "net_listening",
    params: [],
    id: 67,
    jsonrpc: "2.0",
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };
  var status = "DOWN";
  await fetch(NODE_URL + ":" + HTTP_PORT, requestOptions)
    .then((response) => response.text())
    .then((result) => {
      // Convert to JSON
      result = JSON.parse(result);
      console.log("result");
      console.log(result.result);
      console.log("from");
      console.log(result.result.from);
      if (result.result) status = "OK";
    })
    .catch((error) => console.log("error", error));
  return status;
}

/* router.post("/status/:network/:node", (req, res) => {
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
}); */

router.post("/start/:network/:node", async (req, res) => {
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
    BOOTNODE_PORT,
  } = parametros;

  const address = getAccount(DIR_NODE);

  if (!fs.existsSync(`${NETWORK_DIR}/enodeKey.log`)) {
    res.send({ result: "bootnode down" });
  } else {
    // Read the enodekey file, convert it to a string and remove the newline character
    const enodekey = fs
      .readFileSync(`${NETWORK_DIR}/enodeKey.log`)
      .toString()
      .replace(/\r?\n|\r/g, "");

    // Fiile the params array with the command line arguments
    const params = [
      "--networkid",
      NETWORK_CHAINID,
      "--bootnodes",
      `enode://${enodekey}@${IP}:0?discport=${BOOTNODE_PORT}`,
      "--syncmode",
      "full",
      "--datadir",
      DIR_NODE,
      "--port",
      PORT,
      "--unlock",
      `0x${address}`,
      "--password",
      `./${DIR_NODE}/pwd`,
      "--authrpc.port",
      AUTHRPC_PORT,
      "--http.api",
      "admin,eth,net,txpool,personal,web3,clique",
      "--allow-insecure-unlock",
      "--http",
      "--graphql",
      "--http.port",
      HTTP_PORT,
      "--mine",
      "--miner.threads",
      "2",
      "--miner.etherbase",
      address,
    ];

    try {
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
    } catch (error) {
      console.log("START NODE error");
      console.log(error);
      res.send({ status: "error", data: error });
    }
  }
});

async function stopNode(DIR_NODE) {
  // const params = fs.readdirSync(`${DIR_NODE}/paramsNodoRunning.json`);
  if (!fs.existsSync(`${DIR_NODE}/paramsNodoRunning.json`)) {
    return;
  }

  var params = fs.readFileSync(`${DIR_NODE}/paramsNodoRunning.json`).toString();

  // Convert to JSON
  params = JSON.parse(params);
  console.log("params", params);
  killPidifExist(params.subproceso.pid);
  deleteIfExists(`${DIR_NODE}/paramsNodoRunning.json`);
}

router.post("/stop/:network/:node", async (req, res) => {
  const NUMERO_NETWORK = parseInt(req.params.network);
  const NUMERO_NODO = parseInt(req.params.node);

  const NETWORK_DIR = `ETH/eth${NUMERO_NETWORK}`;
  const DIR_NODE = `${NETWORK_DIR}/nodo${NUMERO_NODO}`;

  stopNode(DIR_NODE);

  res.send({ result: "ok" });
});

function launchBootnode(DIR_NETWORK, BOOTNODE_PORT) {
  // if file does not exist, create it, otherwise append:
  if (!fs.existsSync(`${DIR_NETWORK}/boot.key`))
    execSync(`bootnode -genkey ${DIR_NETWORK}/boot.key`);

  const params = [
    "-nodekey",
    `${DIR_NETWORK}/boot.key`,
    "-addr",
    `:${BOOTNODE_PORT}`,
  ];

  // Exxecute the command as a subprocess
  const out = fs.openSync(`./${DIR_NETWORK}/bootnode.log`, "w");
  const err = fs.openSync(`./${DIR_NETWORK}/bootnode.log`, "a");
  try {
    const subprocess = spawn("bootnode", params, {
      detached: true,
      stdio: ["ignore", out, err],
    });

    console.log("subprocess");
    console.log(subprocess);

    fs.writeFileSync(
      `${DIR_NETWORK}/paramsBootnode.json`,
      JSON.stringify({ subproceso: subprocess }, null, 4)
    );

    try {
      // Read file boot.key
      const bootkey = fs.readFileSync(`${DIR_NETWORK}/boot.key`).toString();
      const enodeKeyOut = fs.openSync(`./${DIR_NETWORK}/enodeKey.log`, "w");
      const enodeKeyErr = fs.openSync(`./${DIR_NETWORK}/enodeKey.log`, "a");

      const enodeKey = spawn(
        "bootnode",
        ["-nodekeyhex", bootkey, "-writeaddress"],
        {
          detached: true,
          stdio: ["ignore", enodeKeyOut, enodeKeyErr],
        }
      );
    } catch (e) {
      console.log(e);
    }

    //subprocess.unref();
  } catch (e) {
    console.log(e);
  }
}

router.post("/startbootnode/:network", async (req, res) => {
  const NUMERO_NETWORK = parseInt(req.params.network);
  const NETWORK_DIR = `ETH/eth${NUMERO_NETWORK}`;
  const BOOTNODE_PORT = 30305 + NUMERO_NETWORK;
  launchBootnode(NETWORK_DIR, BOOTNODE_PORT);

  res.send({ result: "done" });
});

async function killPidifExist(pid) {
  await ps.lookup({ pid: pid }, function (err, resultList) {
    if (err) {
      throw new Error(err);
    }
    var process = resultList[0];

    if (process) {
      return killPid(pid);
    } else {
      return "no-pid";
    }
  });
}

async function killPid(pid) {
  const result_kill = await ps.kill(pid, function (err) {
    if (err) {
      throw new Error(err);
    } else {
      console.log("Process %s has been killed!", pid);
    }
  });

  return result_kill;
}

async function stopbootnode(NUMERO_NETWORK) {
  const NETWORK_DIR = `ETH/eth${NUMERO_NETWORK}`;
  var params = fs.readFileSync(`${NETWORK_DIR}/paramsBootnode.json`).toString();

  // Convert to JSON
  params = JSON.parse(params);

  const result_kill = await killPidifExist(params.subproceso.pid);
  deleteIfExists(`${NETWORK_DIR}/paramsBootnode.json`);
  deleteIfExists(`${NETWORK_DIR}/enodeKey.log`);

  return result_kill;
}

router.post("/stopbootnode/:network", async (req, res) => {
  const NUMERO_NETWORK = parseInt(req.params.network);

  const result_kill = await stopbootnode(NUMERO_NETWORK);

  setTimeout(() => {
    res.send({ result: result_kill });
  }, 1000);
});
router.post("/lastblock/:network/:node", (req, res) => {
  const NUMERO_NETWORK = parseInt(getNumbersInString(req.params.network));
  const NUMERO_NODO = parseInt(getNumbersInString(req.params.node));

  const parametros = generateParameter(NUMERO_NETWORK, NUMERO_NODO);

  const { HTTP_PORT } = parametros;

  const comando =
    'geth attach --exec "eth.blockNumber" ' + NODE_URL + ":" + HTTP_PORT;
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

  const { HTTP_PORT } = parametros;
  console.log("NUMERO_BLOCK");
  console.log(NUMERO_BLOCK);
  // convert to hexadecimal
  //const hexa = parseInt(NUMERO_BLOCK, 16);
  const hexa = "0x" + NUMERO_BLOCK.toString(16);

  console.log("hexa");
  console.log(hexa);

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    method: "eth_getBlockByNumber",
    params: [hexa, false],
    id: 1,
    jsonrpc: "2.0",
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };
  try {
    fetch(NODE_URL + ":" + HTTP_PORT, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        // Convert to JSON
        result = JSON.parse(result);
        console.log("result");
        console.log(result.result);
        res.send([
          {
            hash: result.result.hash,
            transactions: result.result.transactions,
          },
        ]);
      })
      .catch((error) => console.log("error", error));
  } catch (error) {
    console.log(error);
  }
});
router.post("/blocktx/:network/:node/:tx", (req, res) => {
  const NUMERO_NETWORK = parseInt(getNumbersInString(req.params.network));
  const NUMERO_NODO = parseInt(getNumbersInString(req.params.node));
  const HASHTX = req.params.tx;
  const parametros = generateParameter(NUMERO_NETWORK, NUMERO_NODO);

  const { HTTP_PORT } = parametros;

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    method: "eth_getTransactionByHash",
    params: [HASHTX],
    id: 1,
    jsonrpc: "2.0",
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };
  try {
    fetch(NODE_URL + ":" + HTTP_PORT, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        // Convert to JSON
        result = JSON.parse(result);
        console.log("result");
        console.log(result.result);
        console.log("from");
        console.log(result.result.from);
        res.send([
          {
            blockHash: result.result.blockHash,
            from: result.result.from,
            to: result.result.to,
            value: result.result.value,
            gas: result.result.gas,
            gasPrice: result.result.gasPrice,
          },
        ]);
      })
      .catch((error) => console.log("error", error));
  } catch (error) {
    console.log(error);
  }
});

function getAccountFromKeystore(DIR_NODE) {
  // loop the files inside DIR_NODE
  const keystore_path = DIR_NODE + "/keystore";
  console.log("DIR_NODE");
  console.log(DIR_NODE);
  /* const accounts = fs
    .readdirSync(`${DIR_NODE}/keystore/${j.name}`, { withFileTypes: true })
    .filter((j) => j.isFile()); */

  const accountFile = fs.readdirSync(`${DIR_NODE}/keystore`)[0];
  console.log("accountFile");
  console.log(accountFile);
  /* const address = JSON.parse(
    fs.readFileSync(`${DIR_NODE}/keystore/${lista[0]}`).toString()
  ).address; */

  const json = JSON.parse(
    fs.readFileSync(`${DIR_NODE}/keystore/${accountFile}`)
  );
  const web3 = new Web3("http://localhost:9566");
  console.log(`${DIR_NODE}/pwd`);
  const password = fs.readFileSync(`${DIR_NODE}/pwd`).toString();
  const account = web3.eth.accounts.decrypt(json, password);
  console.log("account");
  console.log(account);
  return account;
}

router.post("/faucet/:network/:node/:address", (req, res) => {
  const NUMERO_NETWORK = parseInt(getNumbersInString(req.params.network));
  const NUMERO_NODO = parseInt(getNumbersInString(req.params.node));
  const ADDRESS = req.params.address;
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

  const account = getAccountFromKeystore(DIR_NODE);
});
