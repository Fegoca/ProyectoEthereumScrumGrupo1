import React, { useEffect, useState } from "react";
import axios from "axios";

export const NetworkList = () => {
  // useState to store the network list
  const [network, setNetwork] = useState([]);
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
              <h5 className="card-header">{network.numero}</h5>
              <div className="card-body">
                <p className="card-text">Chain id: {network.chainid}</p>

                <h5 className="card-title">Nodes</h5>
                {network.nodes.map((node) => (
                  <p className="card-text" key={node.name}>
                    {node.name}
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
