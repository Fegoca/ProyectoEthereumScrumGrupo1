import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import web3 from "web3";
import loader from "../assets/loader.gif";

export const OperarRedes = (props) => {
  const url = "http://localhost:3000";

  const { register, handleSubmit, errors } = useForm();
  const [lastblock, setLastBlock] = useState();
  const [blockdata, setBlockData] = useState([]);
  const [tx, setTx] = useState(null);
  const [modalBoxFlag, setModalBoxFlag] = useState(false);
  const [loaderFlag, setLoaderFlag] = useState(false);
  const [faucetMessage, setFaucetMessage] = useState(null);

  useEffect(() => {
    getLastBlock(props.network, props.node);
  }, []);
  function onSubmit(data) {
    var blockdata = parseInt(data.blocktoread);
    getBlockData(props.network, props.node, blockdata);
  }

  function showLoader() {
    setModalBoxFlag(true);
    setLoaderFlag(true);
  }

  function hideLoader() {
    setModalBoxFlag(false);
    setLoaderFlag(false);
  }

  async function faucet(data) {
    showLoader();
    console.log(data.address);

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    };
    try {
      const response = await fetch(
        url +
          "/network/" +
          "/faucet/" +
          props.network +
          "/" +
          props.node +
          "/" +
          data.address,
        requestOptions
      );
      const datos = await response.json();
      console.log("datos");
      console.log(datos);
      hideLoader();
      setFaucetMessage("The faucet has been sent to your address");
      getLastBlock(props.network, props.node);
      getBlockData(props.network, props.node, lastblock);
      // reload the page
      //window.location.reload();
    } catch (error) {
      console.log("error");
      console.log(error);
      hideLoader();
    }
  }

  async function onSubmit2(data) {
    showLoader();
    //var datatx=parseInt(data.txid);
    //var datahex= ('0000' + datatx.toString(16).toUpperCase()).slice(-4);
    await getTx(props.network, props.node, data.txid);
  }
  async function getLastBlock(net, node) {
    showLoader();
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    };
    var bloque = [];
    try {
      const response = await fetch(
        url + "/network/" + "/lastblock/" + net + "/" + node,
        requestOptions
      );
      const datos = await response.json();
      bloque.push(datos.Salida);
      hideLoader();
      // reload the page
      //window.location.reload();
    } catch (error) {
      console.log("error");
      console.log(error);
      hideLoader();
    }

    setLastBlock(bloque);
  }

  //elegir bloque de la red {props.network} listar transacciones del bloque con hash y fecha
  async function getBlockData(net, node, block) {
    showLoader();
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    };

    try {
      const response = await fetch(
        url + "/network/" + "block/" + net + "/" + node + "/" + block,
        requestOptions
      );
      const data = await response.json();
      console.log("data");
      console.log(data);

      var aux = {
        hash: data[0].hash,
        transactions: data[0].transactions,
      };
      setBlockData(aux);
      hideLoader();
      // reload the page
      //window.location.reload();
    } catch (error) {
      console.log("error");
      console.log(error);
      hideLoader();
    }
  }

  //dada una transacción  ver -from -to -amount -hash -fee -timestamp -confirmations -blockhash -blockheight
  async function getTx(net, node, param_tx) {
    showLoader();
    console.log("net");
    console.log(net);
    console.log("node");
    console.log(node);
    console.log("param_tx");
    console.log(param_tx);
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    };

    try {
      const response = await fetch(
        url + "/network/" + "blocktx/" + net + "/" + node + "/" + param_tx,
        requestOptions
      );
      const data = await response.json();
      console.log("data");
      console.log(data[0]);
      // Create an empty array
      //web3.utils.fromWei(parseInt(tx.value, 16), "ether");
      var aux = {
        from: data[0].from,
        to: data[0].to,
        blockHash: data[0].blockHash,
        value: web3.utils.fromWei(data[0].value, "ether"),
        gas: web3.utils.fromWei(data[0].gas, "ether"),
        gasPrice: web3.utils.fromWei(data[0].gasPrice, "ether"),
      };
      setTx(aux);
      hideLoader();
    } catch (error) {
      console.log("error");
      console.log(error);
      hideLoader();
    }
  }

  return (
    <div className="node_wrap">
      <h5>Operar redes {props.network} </h5>

      {modalBoxFlag && (
        <div id="modal_box" className="crypto_modal_box">
          {loaderFlag && (
            <img src={loader} alt="loader" className="crypto_modal_loader" />
          )}
        </div>
      )}

      {"nodo1" === props.node && (
        <div className="card mb-4 ">
          <p>
            <strong>FAUCET</strong>
          </p>
          <form onSubmit={handleSubmit(faucet)}>
            <div className="mb-2">
              Address: <input type="text" min="0" {...register("address")} />
            </div>

            <div className="mb-4">
              <input
                className="mb-2 btn btn-primary"
                type="submit"
                value="Send 100 ETH"
              />
            </div>
          </form>
          {faucetMessage && faucetMessage.length > 0 && (
            <div
              id="warning_message"
              className="p-3 mb-2 bg-success text-white"
            >
              {faucetMessage}
            </div>
          )}
        </div>
      )}
      <p>
        Bloques: {parseInt(lastblock) + 1} Último bloque: {lastblock}
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <p>
          Obtener bloque:{" "}
          <input type="number" min="0" {...register("blocktoread")} />
          <input type="submit" value="Obtener" />
        </p>
      </form>

      <div>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Block data {blockdata.hash}</h5>

            {blockdata.transactions &&
              blockdata.transactions.map((transaction) => (
                <div className="mb-4 border">
                  <div key={transaction}>
                    <strong>Transaction:</strong> {transaction}
                  </div>
                  <div>
                    <button
                      onClick={() =>
                        getTx(props.network, props.node, transaction)
                      }
                      className="mb-2 btn btn-primary"
                    >
                      Check transaction
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit2)}>
        <p>
          Obtener tx por hash: <input type="text" {...register("txid")} />
          <input type="submit" value="Obtener" />
        </p>
      </form>

      <div>
        {console.log("tx")}
        {console.log(tx)}
        {tx && (
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                Transaction of block {tx.blockHash}
              </h5>
              <div>
                <strong>From:</strong> {tx.from}
              </div>
              <div>
                <strong>To:</strong> {tx.to}
              </div>
              <div>
                <strong>Value:</strong> {tx.value} ETH
              </div>
              <div>
                <strong>Gas</strong>: {tx.gas} ETH
              </div>
              <div>
                <strong>GasPrice:</strong> {tx.gasPrice} ETH
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
