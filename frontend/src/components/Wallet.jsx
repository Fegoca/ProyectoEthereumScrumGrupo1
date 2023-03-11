import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import web3 from "web3";

export function Wallet() {
  const [balance, setBalance] = useState();
  const [cuenta, setCuenta] = useState();
  const [errorMsg, setErrorMsg] = useState();
  const [botonAction, setBotonAction] = useState("Connectar Wallet");
  const [txstatus, setTxstatus] = useState();
  const { register, handleSubmit, errors } = useForm();

  useEffect(() => {}, []);
  const connectWallet = async () => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((result) => {
          accountChangedHandler(result[0]);
          setBotonAction("wallet Conectada");
        });
    } else {
      setErrorMsg("No se ha podido conectar al Wallet, instala Metamask");
    }
  };
  const accountChangedHandler = (newaccount) => {
    setCuenta(newaccount);
    getBalanceEth(newaccount.toString());
  };
  const getBalanceEth = (address) => {
    window.ethereum
      .request({ method: "eth_getBalance", params: [address, "latest"] })
      .then((balance) => {
        var balanceEth = web3.utils.fromWei(balance, "ether");
        //var balanceEth = ethers.utils.parseEther(balance);
        //var balanceBN = parseInt(balance,16)
        setBalance(balanceEth);
      });
  };
  function transferETH(data) {
    const txparams = {
      from: cuenta,
      to: data.toadress,
      //value: ethers.utils.parseEther(data.value)
      value: web3.utils.toWei(data.value, "ether"),
    };
    try {
      window.ethereum.request({
        method: "eth_sendTransaction",
        params: [txparams],
      });
      setTxstatus("Transacción realizada con éxito");
    } catch (error) {
      setTxstatus("Error al realizar la transacción");
    }

    console.log(data.toadress);
    console.log(data.value);
  }

  window.ethereum.on("accountsChanged", accountChangedHandler);
  return (
    <div className="mb-4 border card-text">
      <h5 className="card-header">METAMASK WALLET</h5>
      <p></p>
      <button onClick={() => connectWallet()}>{botonAction}</button>
      <p></p>
      {cuenta && (
        <div>
          Cuenta:{cuenta}
          <form onSubmit={handleSubmit(transferETH)}>
            {balance && <p>Saldo: {balance}</p>}

            <p>
              Cuenta destino: <input type="text" {...register("toadress")} />
              Cantidad: <input type="number" min="0" step="any"{...register("value")} />
            </p>

            <p>
              <input type="submit" value="Enviar" />
            </p>
            <p>{txstatus}</p>
          </form>
        </div>
      )}

      <p>{errorMsg}</p>
    </div>
  );
}
