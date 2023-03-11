import React, { useEffect, useState } from "react";
import axios from "axios";

export const NetworkList = () => {
  // useState to store the network list
  const [network, setNetwork] = useState([]);
  const [message, setMessage] = useState(null);
  const [nodeStatus, setNodeStatus] = useState([]);

  const url = "http://localhost:3000";
  //sacar numeros de cadena
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
  // useEffect async function
  useEffect(() => {
    getNetworks();
  }, []);

  // get networks function async to be called in useEffect
  async function getNetworks() {
    axios
      .get(url + "/network")
      .then((response) => {
        console.log(response.data);
        var networkdata = response.data;
        checkNodeStatus(networkdata);
        setNetwork(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // add network function async to be called in button
  async function addNetwork() {
    /* const data = {
      network: network.length + 1,
      node: 1,
    };
    console.log("data");
    console.log(data); */
    console.log("Adding network ... ");
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        network: network.length + 1,
        cuenta: "0x29f9e221f303059ba9f7aFBbDaB25ede852A6585",
      }),
    };

    try {
      const response = await fetch(url + "/network/create/", requestOptions);
      const data = await response.json();
      console.log("data");
      console.log(data);
      // reload the page
      window.location.reload();
    } catch (error) {
      window.location.reload();
      console.log("error");
      console.log(error);
    }
  }

  async function startNode(network, node) {
    var networkNum = getNumbersInString(network);
    var nodeNum = getNumbersInString(node);
    console.log("Starting node ... ");
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    };

    try {
      const response = await fetch(
        url + "/network/start/" + networkNum + "/" + nodeNum,
        requestOptions
      );
      const data = await response.json();
      console.log("start NODE ---- ");
      console.log(data);
      console.log("data.result");
      console.log(data.result);
      if ("bootnode down" === data.result) {
        setMessage(
          "Bootnode of NetWork " +
            networkNum +
            " is down, please start it first"
        );
      } else {
        // reload the page
        window.location.reload();
      }
    } catch (error) {
      console.log("start error");
      console.log(error);
    }
  }

  async function stopNode(network, node) {
    var networkNum = getNumbersInString(network);
    var nodeNum = getNumbersInString(node);
    console.log("Starting node ... ");
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    };

    try {
      const response = await fetch(
        url + "/network/stop/" + networkNum + "/" + nodeNum,
        requestOptions
      );
      const data = await response.json();
      console.log("data");
      console.log(data);
      // reload the page
      window.location.reload();
    } catch (error) {
      console.log("error");
      console.log(error);
    }
  }

  async function startBootnode(network) {
    var networkNum = getNumbersInString(network);
    console.log("stopBootnode ... ");
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    };

    try {
      const response = await fetch(
        url + "/network/startbootnode/" + networkNum,
        requestOptions
      );
      const data = await response.json();
      console.log("data");
      console.log(data);
      // reload the page
      window.location.reload();
    } catch (error) {
      console.log("error");
      console.log(error);
    }
  }

  async function stopBootnode(network) {
    var networkNum = getNumbersInString(network);
    console.log("stopBootnode ... ");
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    };

    try {
      const response = await fetch(
        url + "/network/stopbootnode/" + networkNum,
        requestOptions
      );
      const data = await response.json();
      console.log("data");
      console.log(data);
      // reload the page
      window.location.reload();
    } catch (error) {
      console.log("error");
      console.log(error);
    }
  }

  async function addNetwork2(network) {
    /* const data = {
      network: network.length + 1,
      node: 1,
    };
    console.log("data");
    console.log(data); */
    console.log("Adding network ... ");
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        network: network,
        cuenta: "0x29f9e221f303059ba9f7aFBbDaB25ede852A6585",
      }),
    };

    try {
      const response = await fetch(url + "/network/create/", requestOptions);
      const data = await response.json();
      console.log("data");
      console.log(data);
      // reload the page
      window.location.reload();
    } catch (error) {
      console.log("error");
      console.log(error);
    }
  }

  // Preguntar a chat

  async function checkNodeStatus(networkdata) {
    console.log("check status ");

    //constante requestOptions
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    };

    //copia del network
    //var networkOut = JSON.parse(JSON.stringify(networkdata));
    var valores = [];
    var status = "";
    for (let i = 0; i < networkdata.length; i++) {
      for (let j = 0; j < networkdata[i].nodes.length; j++) {
        try {
          /* setTimeout(()=> {
             console.log("Esperando Status:"+networkdata[i].numero+networkdata[i].nodes[j].name)
          }
          ,200);*/
          const response = await fetch(
            url +
              "/network/status/" +
              getNumbersInString(networkdata[i].numero) +
              "/" +
              getNumbersInString(networkdata[i].nodes[j].name),
            requestOptions
          );
          console.log(
            "FETCH:" +
              url +
              "/network/status/" +
              getNumbersInString(networkdata[i].numero) +
              "/" +
              getNumbersInString(networkdata[i].nodes[j].name)
          );

          var data = await response.json();
          //console.log("DATA RAW");
          //console.log(data.Salida);
          //si da error que sea NOT OK

          if (data.Salida != "true\n") {
            data = "NOT OK";
            networkdata[i].nodes[j].status = data;
            status =
              networkdata[i].numero +
              " " +
              networkdata[i].nodes[j].name +
              " " +
              data +
              " / ";
            valores.push(status);
          } else {
            data = "OK";
            networkdata[i].nodes[j].status = data;
            status =
              networkdata[i].numero +
              " " +
              networkdata[i].nodes[j].name +
              " " +
              data +
              " / ";
            valores.push(status);
          }
          //console.log("DATA despues de filtrar error");
          console.log(data);
          //indice nodo
          //setNodecount(valores.length-1)
          //metemos los datos al useState.
          //setNodeStatus(valores)
        } catch (error) {
          console.log("error");
          console.log(error);
        }
      }
    }
    //console.log(JSON.stringify(networkdata))
    //setcopianetwork(networkdata)
    setNodeStatus(valores);
  }
  async function deleteNetwork(network) {
    console.log("delete network ... ");
    const requestOptions = {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    };

    try {
      const response = await fetch(
        url + "/network/net/" + network,
        requestOptions
      );
      const data = await response.json();
      console.log("data");
      console.log(data);
      // reload the page
      window.location.reload();
    } catch (error) {
      console.log("error");
      console.log(error);
    }
  }

  async function deleteNode(network, nodeNum) {
    var networkNum = getNumbersInString(network);
    console.log("delete node ... ");
    const requestOptions = {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    };

    try {
      const response = await fetch(
        url + "/network/node/" + networkNum + "/" + nodeNum,
        requestOptions
      );
      const data = await response.json();
      console.log("data");
      console.log(data);
      // reload the page
      window.location.reload();
    } catch (error) {
      console.log("error");
      console.log(error);
      window.location.reload();
    }
  }

  // Promt Function to get the net number desired by the user

  function hacerPregunta() {
    const netNumber = prompt("Escribe tu respuesta");
    addNetwork2(netNumber);
  }

  async function addNode(netNumber, nodenum) {
    //"/add/:network/:node"
    var nextNet = getNumbersInString(netNumber);
    console.log(nextNet);
    console.log(nodenum);

    /* var nextNet = getNumbersInString(netNumber);
    var nextNode = getNumbersInString(nodenum);
    nextNode++;
    console.log(nextNet);
    console.log(nextNode);
    console.log("Adding NODE ... ");
    console.log("Red " + nextNet);
    console.log("Nodo " + nextNode); */
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    };

    try {
      const response = await fetch(
        url + "/network/" + "add/" + nextNet + "/" + nodenum,
        requestOptions
      );
      const data = await response.json();
      console.log("data");
      console.log(data);

      // reload the page
      window.location.reload();
    } catch (error) {
      console.log("error***********");
      console.log(error);
      window.location.reload();
    }
  }
  async function reloadNetwork(netWorkReload) {
    //"/add/:network/:node"

    var nextNet = getNumbersInString(netWorkReload);

    console.log("Red a levantar: " + netWorkReload);

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    };

    try {
      const response = await fetch(
        url + "/network/" + "reload/" + netWorkReload,
        requestOptions
      );
      const data = await response.json();
      console.log("data");
      console.log(data);
      // reload the page
      window.location.reload();
    } catch (error) {
      console.log("error");
      console.log(error);
    }
  }
  //reload/:network
  return (
    <div>
      <div className="card card-custom">
        <h5 className="card-header">NETWORKS</h5>

        <div id="warning_message" className="p-3 mb-2 bg-warning text-dark">
          {message}
        </div>

        <div className="card-body">
          <p></p>
          <div className="d-flex flex-wrap justify-content-center">
            {network &&
              network.map((network) => (
                <div className="card card-custom" key={network.chainid}>
                  <h5 className="card-header">Network {network.numero}</h5>
                  <div className="card-body">
                    <p className="card-text">Chain id: {network.chainid}</p>

                    <div className="bg-dark text-white">BOOTNODE </div>
                    {"down" === network.bootnode ? (
                      <div>
                        <div className="mb-2 bg-warning text-dark">
                          Status: <span>Down</span>
                        </div>
                        <div>
                          <button
                            onClick={() => startBootnode(network.numero)}
                            className="mb-2 btn btn-primary"
                          >
                            Start bootnode
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-2 bg-success text-dark">
                          Status: <span>UP</span>
                        </div>
                        <div>
                          <button
                            onClick={() => stopBootnode(network.numero)}
                            className="mb-2 btn btn-danger"
                          >
                            Stop bootnode
                          </button>
                        </div>
                      </div>
                    )}

                    <hr></hr>

                    <h5 className="card-title">Nodes</h5>

                    {network.nodes.map((node) => (
                      <div
                        id="nodo"
                        className="mb-4 border card-text"
                        key={node.name}
                      >
                        <div className="bg-info">{node.name} </div>

                        {node.status != "OK" ? (
                          <div>
                            <div className="mb-2 bg-warning text-dark">
                              Status: <span>Down</span>
                            </div>
                            <div className="mb-2">
                              http port: {node.http_port}
                            </div>
                            <div>
                              <button
                                onClick={() =>
                                  startNode(network.numero, node.name)
                                }
                                className="mb-2 btn btn-primary"
                              >
                                Start node
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="mb-2 bg-success text-dark">
                              Status: <span>UP</span>
                            </div>
                            <div className="mb-2">
                              http port: {node.http_port}
                            </div>
                            <div>
                              <button
                                onClick={() =>
                                  stopNode(network.numero, node.name)
                                }
                                className="mb-2 btn btn-danger"
                              >
                                Stop node
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="mb-1">
                      {network.nodes.length > 0 ? (
                        <button
                          onClick={() =>
                            deleteNode(network.numero, network.nodes.length)
                          }
                          className="mb-2 btn btn-danger btn-sm"
                        >
                          Remove Node {network.nodes.length}
                        </button>
                      ) : (
                        <div></div>
                      )}
                    </div>
                    <div className="mb-1">
                      <button
                        onClick={() =>
                          addNode(network.numero, network.nodes.length + 1)
                        }
                        className="mb-2 btn btn-success btn-sm"
                      >
                        Add Node {network.nodes.length + 1}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div className="mb-1">
          {network.length > 0 ? (
            <button
              onClick={() => deleteNetwork(network.length)}
              className="mb-2 btn btn-danger"
            >
              Remove Network {network.length}
            </button>
          ) : (
            <div></div>
          )}
        </div>
        <div className="mb-1">
          <button onClick={() => addNetwork()} className="btn btn-success mb-2">
            Add Network {network.length + 1}
          </button>
        </div>

        {/* <p>
          <button
            onClick={() => hacerPregunta()}
            className="btn btn-primary mb-3"
          >
            Add Network ID
          </button>
        </p> */}
      </div>
    </div>
  );
};
