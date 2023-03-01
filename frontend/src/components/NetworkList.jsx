import React, { useEffect, useState } from "react";
import axios from "axios";


export const NetworkList = () => {
  // useState to store the network list
  const [network, setNetwork] = useState([]);
  const [nodeStatus, setNodeStatus] = useState([]);
  const [nodecount, setNodecount] = useState(0);

  const url = "http://localhost:3000";

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


  async function checkNodeStatus(networkdata) {
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
    //sacar nodos existentes      
    for (let i = 0; i < networkdata.length; i++) {
      console.log(networkdata[i].numero);

      for (let j = 0; j < networkdata[i].nodes.length; j++) {

        console.log(networkdata[i].nodes[j].name);
      }
    }

    console.log("check status ");

    //constante requestOptions
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({

      }),
    };
    let valores =[];
    for (let i = 0; i < networkdata.length; i++) {
      for (let j = 0; j < networkdata[i].nodes.length; j++) {
        try {
          const response = await fetch(url + "/network/status/" + getNumbersInString(networkdata[i].numero) + "/" + getNumbersInString(networkdata[i].nodes[j].name), requestOptions);

          console.log("FETCH:" + url + "/network/status/" + getNumbersInString(networkdata[i].numero) + "/" + getNumbersInString(networkdata[i].nodes[j].name))

          var data = await response.json();
          console.log("DATA RAW");
          console.log(data.Salida);
          //si da error que sea NOT OK
          
          if (data.Salida != "true\n") {
            data = "NOT OK";
            valores.push(data);
          }else{
            data = "OK"
            valores.push(data);
          }
          console.log("DATA despues de filtrar error");
          console.log(data);
          

        } catch (error) {
          console.log("error");
          console.log(error);
        }
      }
    }
    //metemos los datos al useState.
    setNodeStatus(valores)
  }

  return (
    <div>
      <div className="card card-custom">
        <h5 className="card-header">NETWORKS</h5>
        <div className="card-body">
          <p className="card-title">Networks available in our project</p>
        </div>
      </div>
      <p></p>
      <div className="d-flex flex-wrap justify-content-center">
        {network &&
          network.map((network) => (
            <div className="card card-custom" key={network.chainid}>
              <h5 className="card-header">{network.numero}<button onClick={() => console.log("DELETE")} className="btn btn-primary mb-3">DELETE</button></h5>
              <div className="card-body">
                <p className="card-text">Chain id: {network.chainid}</p>

                <h5 className="card-title">Nodes :<button onClick={() => console.log("ADD NODO")} className="btn btn-primary mb-3">ADD</button></h5>
                {network.nodes.map((node) => (
                  <p id="nodo" className="card-text" key={node.name}>
                    {node.name} State: <button onClick={() =>console.log("LEVANTAR NODO")} className="btn btn-primary mb-3">{nodeStatus[0]}</button>{}
                  </p>
                ))}
              </div>
            </div>
          ))}
      </div>
      <div className="card-custom">
        <button onClick={() => addNetwork()} className="btn btn-primary mb-3">
          Add Network {network.length + 1}
        </button>
      </div>
    </div>
  );
};
