import React, { useEffect, useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { useForm } from "react-hook-form";
const { ethereum } = window;

export const Faucet = () => {
  const [balance, setBalance] = useState(0);
  // const [address, setAddress] = useState("");
  const [provider, setProvider] = useState();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    console.log(data);
    // const { address } = data;
    console.log(address);
    // setAddress(address);
    // Axios to call the faucet endpoint, send the address as a parameter and get the balance to localhost:3000 and display loading message while waiting for the response
    const response = await axios.get(`http://localhost:3000/faucet/${address}`);
    console.log(response);

    const balance = await provider.getBalance(address);
    setBalance(ethers.utils.formatEther(balance));
  };

  // function to fetch a url to send the address to the faucet endpoint
  /* const fetchUrl = async () => {
    const response = await fetch(`http://localhost:3000/faucet/${address}`); */

  useEffect(() => {
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      setProvider(provider);
    }
  }, []);

  return (
    <div>
      <h1>Faucet</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          className="form-control"
          id="address"
          placeholder="0x00...."
          defaultValue="0x29f9e221f303059ba9f7afbbdab25ede852a6585"
          {...register("address", { required: true })}
        />
        {errors.address && <span>This addrees is required</span>}
        <input type="submit" />
      </form>
      <h2>Link to receive in your account</h2>
      {/* <button onClick={} */}
      /* <p>Balance: {balance}</p> */
    </div>
  );
};
