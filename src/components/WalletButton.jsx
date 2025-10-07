import { shortenAddress, useEthers, useLookupAddress } from "@usedapp/core";
import React, { useEffect, useState } from "react";

const WalletButton = () => {
  const [accountAddress, setAccountAddress] = useState("");
  const { ens } = useLookupAddress();
  const { activateBrowserWallet, deactivate, account } = useEthers();

  useEffect(() => {
    if (ens) {
      setAccountAddress(ens);
    } else if (account) {
      setAccountAddress(shortenAddress(account));
    } else {
      setAccountAddress("");
    }
  }, [account, ens, setAccountAddress]);

  return (
    <button
      onClick={() => {
        !account ? activateBrowserWallet() : deactivate();
      }}
      className="bg-site-pink border-none outline-none px-6 py-2 font-poppins font-bold text-lg text-white rounded-3xl leading-[24px] hover:bg-pink-600 transition-all cursor-pointer"
    >
      {accountAddress || "Connect Wallet"}
    </button>
  );
};

export default WalletButton;
