import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export const OperarRedes = (props) => {
  const url = "http://localhost:3000";

  const { register, handleSubmit, errors } = useForm();
  const [lastblock, setLastBlock] = useState();
  const [blockdata, setBlockData] = useState([]);
  const [tx, setTx] = useState();

  useEffect(() => {
    getLastBlock(props.network, props.node);
  }, []);
  function onSubmit(data) {
    var blockdata = parseInt(data.blocktoread);
    getBlockData(props.network, props.node, blockdata);
  }
  function onSubmit2(data) {
    //var datatx=parseInt(data.txid);
    //var datahex= ('0000' + datatx.toString(16).toUpperCase()).slice(-4);
    getTx(props.network, props.node, data.txid);
  }
  async function getLastBlock(net, node) {
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
      // reload the page
      //window.location.reload();
    } catch (error) {
      console.log("error");
      console.log(error);
    }

    setLastBlock(bloque);
  }

  //elegir bloque de la red {props.network} listar transacciones del bloque con hash y fecha
  async function getBlockData(net, node, block) {
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

      var datafiltrado = data.stdout.replace(/\n/g, "");
      datafiltrado = datafiltrado.replace(/\\/g, "");

      console.log("data filtrado");
      console.log(datafiltrado);
      var objson = JSON.stringify(datafiltrado);
      //console.log(objson["hash"]);

      objson = JSON.parse(objson);
      //console.log(objson["hash"]);

      console.log(objson.length);
      setBlockData(objson);
      // reload the page
      //window.location.reload();
    } catch (error) {
      console.log("error");
      console.log(error);
    }
  }

  //dada una transacción  ver -from -to -amount -hash -fee -timestamp -confirmations -blockhash -blockheight
  async function getTx(net, node, tx) {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    };

    try {
      const response = await fetch(
        url + "/network/" + "blocktx/" + net + "/" + node + "/" + tx,
        requestOptions
      );
      const data = await response.json();
      console.log("data");
      console.log(data);
      setTx(data.stdout);
      /*//var datafiltrado=data.stdout.replace(/\n/g,"")
      //datafiltrado=datafiltrado.replace(/\\/g,"")
      
      console.log("data filtrado");
      console.log(datafiltrado);
      var objsontx = JSON.stringify(datafiltrado);
      console.log(objson["hash"]);
      
      objson = JSON.parse(objsontx);
      console.log();
      
      console.log(objsontx.length);      
      setTx(objsontx);
      // reload the page
      //window.location.reload();*/
    } catch (error) {
      console.log("error");
      console.log(error);
    }
  }

  /*{blockdata&&blockdata.map((propiedad)=>{
         <li key={propiedad}>
          {blockdata.hash}</li>
       })}
       {blockdata.transaction.map((tx)=>{
        <p key={tx}>{transaccion}</p>
       })}
       <li>{blockdata.slice(154,230)}</li> 
       <li>{blockdata.slice(1357,1373)}</li>*/
  //var blockdatis=JSON.parse(blockdata)
  //setBlockData(blockdatis)
  return (
    <div>
      <h5>Operar redes {props.network} </h5>
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
      
      {blockdata}
       
      <form onSubmit={handleSubmit(onSubmit2)}>
        <p>
          Obtener tx por hash: <input type="text" {...register("txid")} />
          <input type="submit" value="Obtener" />
        </p>
      </form>

      <p>{tx}</p>
    </div>
  );
};
