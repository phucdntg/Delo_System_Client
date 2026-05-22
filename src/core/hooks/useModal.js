import { useState } from "react";

const useModal = () => {
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);

  const openModal = (record = null) => {
    setOpen(true);
    setData(record);
  };

  const closeModal = () => {
    setOpen(false);
    setData(null);
  };

  return { open, data, setData, openModal, closeModal };
};

export default useModal;
