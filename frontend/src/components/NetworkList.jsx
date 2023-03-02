import React, { useEffect, useState } from "react";
import axios from "axios";


export const NetworkList = () => {
  // useState to store the network list
  const [network, setNetwork] = useState([]);
  const [nodeStatus, setNodeStatus] = useState([]);
  //const [nodecount, setNodecount] = useState(0);

  const url = "http://localhost:3000";
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

    //sacar numeros de cadena 
    
    //copia del network 
    /*const cloneArray = items =>
    items.map(item =>
    Array.isArray(item)
      ? cloneArray(item)
      : item
    )

    const networkOut = cloneArray(network)     
    for (let i = 0; i < networkdata.length; i++) {
      // networkOut[i].numero=networkdata[i].numero.toString();

      for (let j = 0; j < networkdata[i].nodes.length; j++) {

        // networkOut[i].nodes[j].name=networkdata[i].nodes[j].name.toString();
      }
    }
    */
    console.log("check status ");

    //constante requestOptions
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({

      }),
    };
    /* //crando array bidimencional
     var valores = new Array(networkdata.length);
     for (var i = 0; i < networkdata.length; i++) {
       valores[i] = new Array(networkdata.nodes.length)
     }
    */
    var valores = [];
    var status = "";
    for (let i = 0; i < networkdata.length; i++) {
      for (let j = 0; j < networkdata[i].nodes.length; j++) {

        try {
          /* setTimeout(()=> {
             console.log("Esperando Status:"+networkdata[i].numero+networkdata[i].nodes[j].name)
          }
          ,200);*/
          const response = await fetch(url + "/network/status/" + getNumbersInString(networkdata[i].numero) + "/" + getNumbersInString(networkdata[i].nodes[j].name), requestOptions); console.log("FETCH:" + url + "/network/status/" + getNumbersInString(networkdata[i].numero) + "/" + getNumbersInString(networkdata[i].nodes[j].name))


          var data = await response.json();
          //console.log("DATA RAW");
          //console.log(data.Salida);
          //si da error que sea NOT OK

          if (data.Salida != "true\n") {
            data = "NOT OK";
            //networkOut[i].nodes[j].name = data;
            status = networkdata[i].numero + " " + networkdata[i].nodes[j].name + " " + data + " / ";
            valores.push(status);
            //valores[j] =networkdata[i].numero+" "+networkdata[i].nodes[j].name+" "+data;
          } else {
            data = "OK"
            //networkOut[i].nodes[j].name = data;
            status = networkdata[i].numero + " " + networkdata[i].nodes[j].name + " " + data + " / ";
            valores.push(status);
            //valores[j] =networkdata[i].numero+" "+networkdata[i].nodes[j].name+" "+data;
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
    //setNodeStatus(networkOut)
    setNodeStatus(valores)

  }
  async function deleteNetwork(network) {


    console.log("delete network ... ");
    const requestOptions = {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({

      }),
    };

    try {
      const response = await fetch(url + "/network/" + network, requestOptions);
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

  // Promt Function to get the net number desired by the user

  function hacerPregunta() {
    const netNumber = prompt('Escribe tu respuesta');
    addNetwork2(netNumber);

  }


  async function addNode(netNumber, nodenum) {
    //"/add/:network/:node"
    
    var nextNet=getNumbersInString(netNumber)
    var nextNode=getNumbersInString(nodenum)
    nextNode++;
    console.log(nextNet);
    console.log(nextNode);
    console.log("Adding NODE ... ");
    console.log("Red "+nextNet);
    console.log("Nodo "+nextNode);
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({

      }),
    };

    try {
      const response = await fetch(url + "/network/"+"add/"+nextNet+"/"+nextNode, requestOptions);
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

  return (
    <div>
      <div className="card card-custom">
        <h5 className="card-header">NETWORKS</h5>
        <div className="card-body">
          <p></p>
          <div className="d-flex flex-wrap justify-content-center">
            {network &&
              network.map((network) => (
                <div className="card card-custom" key={network.chainid}>
                  <h5 className="card-header">{network.numero}<button onClick={() => deleteNetwork(network.numero)} className="btn btn-danger btn-sm">DELETE</button></h5>
                  <div className="card-body">
                    <p className="card-text">Chain id: {network.chainid}</p>

                    <h5 className="card-title">Nodes :</h5>

                    {network.nodes.map((node) => (
                      <div id="nodo" className="card-text" key={node.name}>
                        {node.name}  <button onClick={() => console.log("LEVANTAR NODO")} className="btn btn-info btn-sm">RELOAD</button>

                        <button onClick={() => addNode(network.numero, node.name)} className="btn btn-success btn-sm">ADD</button>
                      </div>
                    ))}

                  </div>
                </div>
              ))}
          </div>
          <div className="card-custom">

            <p> {nodeStatus.length!=0?"Node Status :":"Cheking Node Status"}</p><p> {nodeStatus}</p>
          </div>
        </div>
        <button onClick={() => addNetwork()} className="btn btn-primary mb-3">
          Add Network {network.length + 1}
        </button>
        <p>
          <button onClick={() => hacerPregunta()} className="btn btn-primary mb-3">
            Add Network ID
          </button>
        </p>
      </div>
    </div>
  );
};
