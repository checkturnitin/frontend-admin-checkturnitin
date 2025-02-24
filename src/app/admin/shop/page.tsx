"use client";
import axios from "axios";
import { toast } from "react-toastify";
import React, { useEffect, useState } from "react";
import { serverURL } from "@/utils/utils";
import {
  FiCheckCircle,
  FiEdit,
  FiPlus,
  FiShoppingCart,
  FiToggleLeft,
  FiToggleRight,
  FiX,
} from "react-icons/fi";

interface Item {
  _id: string;
  enable: boolean;
  title: string;
  creditLimit: number;
  country: string;
  currency: string;
  price: number;
  features: string[];
  paddleProductId: string | null;
}

export default function Page() {
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [creditLimit, setCreditLimit] = useState(1);
  const [price, setPrice] = useState(0);
  const [country, setCountry] = useState("NP");
  const [currency, setCurrency] = useState("NPR");
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [enable, setEnable] = useState(false);
  const [paddleProductId, setPaddleProductId] = useState<string | null>(null);
  const [editItemId, setEditItemId] = useState("");

  const getItems = async () => {
    try {
      const response = await axios.get(`${serverURL}/admin/shop`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setItems(response.data);
    } catch (error) {
      toast.error("Failed to fetch items");
    }
  };

  const createItem = async () => {
    if (!title) return toast.error("Please enter a title!");
    if (!creditLimit) return toast.error("Please enter a credit limit!");
    if (!price) return toast.error("Please enter a price!");
    if (currency === "USD" && !paddleProductId)
      return toast.error("Please enter a Paddle Product ID for USD items!");

    try {
      await axios.post(
        `${serverURL}/admin/shop/create`,
        {
          title,
          creditLimit,
          country,
          currency,
          price,
          features,
          paddleProductId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Item created!");
      resetForm();
      getItems();
    } catch (error) {
      toast.error("Failed to create item");
    }
  };

  const editItem = async () => {
    if (!title) return toast.error("Please enter a title!");
    if (!creditLimit) return toast.error("Please enter a credit limit!");
    if (!price) return toast.error("Please enter a price!");
    if (currency === "USD" && !paddleProductId)
      return toast.error("Please enter a Paddle Product ID for USD items!");

    try {
      await axios.put(
        `${serverURL}/admin/shop/${editItemId}`,
        {
          enable,
          title,
          creditLimit,
          country,
          currency,
          price,
          features,
          paddleProductId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Item updated!");
      resetForm();
      getItems();
    } catch (error) {
      toast.error("Failed to update item");
    }
  };

  const toggleItem = async (itemId: string) => {
    try {
      await axios.patch(
        `${serverURL}/admin/shop/${itemId}/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Item status updated!");
      getItems();
    } catch (error) {
      toast.error("Failed to toggle item status");
    }
  };

  const resetForm = () => {
    setTitle("");
    setCreditLimit(1);
    setPrice(0);
    setCountry("NP");
    setCurrency("NPR");
    setFeatures([]);
    setNewFeature("");
    setEnable(false);
    setPaddleProductId(null);
    setEditItemId("");
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  useEffect(() => {
    getItems();
  }, []);

  useEffect(() => {
    setCurrency(country === "NP" ? "NPR" : country === "IN" ? "INR" : "USD");
  }, [country]);

  return (
    <div className="animate-fade-in-bottom w-full h-full p-4 text-black ">
      <h1 className="font-semibold text-2xl flex items-center mb-6">
        <FiShoppingCart className="mr-2" /> Shop Management
      </h1>
      <div className="w-full flex flex-wrap gap-6">
        {items.map((item) => (
          <ItemCard
            key={item._id}
            item={item}
            onEdit={() => {
              setTitle(item.title);
              setCreditLimit(item.creditLimit);
              setPrice(item.price);
              setCountry(item.country);
              setCurrency(item.currency);
              setFeatures(item.features);
              setPaddleProductId(item.paddleProductId);
              setEditItemId(item._id);
              setEnable(item.enable);
            }}
            onToggle={() => toggleItem(item._id)}
          />
        ))}
        <NewItemButton />
      </div>

      <ItemModal
        isNew={true}
        title={title}
        setTitle={setTitle}
        creditLimit={creditLimit}
        setCreditLimit={setCreditLimit}
        price={price}
        setPrice={setPrice}
        country={country}
        setCountry={setCountry}
        currency={currency}
        features={features}
        newFeature={newFeature}
        setNewFeature={setNewFeature}
        addFeature={addFeature}
        removeFeature={removeFeature}
        paddleProductId={paddleProductId}
        setPaddleProductId={setPaddleProductId}
        onSave={createItem}
      />

      <ItemModal
        isNew={false}
        title={title}
        setTitle={setTitle}
        creditLimit={creditLimit}
        setCreditLimit={setCreditLimit}
        price={price}
        setPrice={setPrice}
        country={country}
        setCountry={setCountry}
        currency={currency}
        features={features}
        newFeature={newFeature}
        setNewFeature={setNewFeature}
        addFeature={addFeature}
        removeFeature={removeFeature}
        paddleProductId={paddleProductId}
        setPaddleProductId={setPaddleProductId}
        enable={enable}
        setEnable={setEnable}
        onSave={editItem}
      />
    </div>
  );
}

function ItemCard({
  item,
  onEdit,
  onToggle,
}: {
  item: Item;
  onEdit: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <h2 className="card-title">
            {item.title}
            <div className="badge badge-secondary">
              {item.currency} {item.price}
            </div>
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={onToggle}>
            {item.enable ? (
              <FiToggleRight size={20} />
            ) : (
              <FiToggleLeft size={20} />
            )}
          </button>
        </div>
        <p className="flex items-center">
          <FiCheckCircle className="mr-2" />
          {item.creditLimit} credits
        </p>
        <p className="flex items-center">
          <FiCheckCircle className="mr-2" />
          Country: {item.country}
        </p>
        {item.paddleProductId && (
          <p className="flex items-center">
            <FiCheckCircle className="mr-2" />
            Paddle ID: {item.paddleProductId}
          </p>
        )}
        <div className="mt-2">
          <p className="font-semibold">Features:</p>
          <ul className="list-disc list-inside">
            {item.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
        <div className="card-actions justify-end mt-4">
          <label
            htmlFor="edititem_modal"
            className="btn btn-sm btn-primary"
            onClick={onEdit}
          >
            <FiEdit />
            Edit
          </label>
        </div>
      </div>
    </div>
  );
}

function NewItemButton() {
  return (
    <label
      htmlFor="newitem_modal"
      className="btn h-auto min-h-[30vh] card w-96 bg-base-100 shadow-xl"
    >
      <FiPlus className="text-4xl" />
      <p>New Item</p>
    </label>
  );
}

function ItemModal({
  isNew,
  title,
  setTitle,
  creditLimit,
  setCreditLimit,
  price,
  setPrice,
  country,
  setCountry,
  currency,
  features,
  newFeature,
  setNewFeature,
  addFeature,
  removeFeature,
  paddleProductId,
  setPaddleProductId,
  enable,
  setEnable,
  onSave,
}: {
  isNew: boolean;
  title: string;
  setTitle: (value: string) => void;
  creditLimit: number;
  setCreditLimit: (value: number) => void;
  price: number;
  setPrice: (value: number) => void;
  country: string;
  setCountry: (value: string) => void;
  currency: string;
  features: string[];
  newFeature: string;
  setNewFeature: (value: string) => void;
  addFeature: () => void;
  removeFeature: (index: number) => void;
  paddleProductId: string | null;
  setPaddleProductId: (value: string | null) => void;
  enable?: boolean;
  setEnable?: (value: boolean) => void;
  onSave: () => void;
}) {
  return (
    <>
      <input
        type="checkbox"
        id={isNew ? "newitem_modal" : "edititem_modal"}
        className="modal-toggle"
      />
      <div className="modal">
        <div className="modal-box max-w-3xl">
          <h3 className="font-bold text-lg mb-4">
            {isNew ? "New Item" : "Edit Item"}
          </h3>
          {!isNew && setEnable && (
            <div className="form-control mb-4">
              <label className="label cursor-pointer">
                <span className="flex items-center">
                  <FiCheckCircle className="mr-2" />
                  Enable
                </span>
                <input
                  type="checkbox"
                  className="toggle"
                  checked={enable}
                  onChange={(e) => setEnable(e.target.checked)}
                />
              </label>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Title</span>
              </label>
              <input
                className="input input-bordered w-full"
                placeholder="Item title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Credit Limit</span>
              </label>
              <input
                className="input input-bordered w-full"
                placeholder="Limit"
                type="number"
                min={1}
                value={creditLimit}
                onChange={(e) => setCreditLimit(parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Price</span>
              </label>
              <input
                className="input input-bordered w-full"
                placeholder="Price"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Country</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="NP">Nepal</option>
                <option value="IN">India</option>
                <option value="US">United States</option>
              </select>
            </div>
          </div>
          {currency === "USD" && (
            <div className="mt-4">
              <label className="label">
                <span className="label-text">Paddle Product ID</span>
              </label>
              <input
                className="input input-bordered w-full"
                placeholder="Paddle Product ID"
                value={paddleProductId || ""}
                onChange={(e) => setPaddleProductId(e.target.value)}
              />
            </div>
          )}
          <div className="mt-4">
            <label className="label">
              <span className="label-text">Features</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {features.map((feature, index) => (
                <div key={index} className="badge badge-outline gap-2">
                  {feature}
                  <button
                    onClick={() => removeFeature(index)}
                    className="btn btn-xs btn-ghost"
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="input input-bordered flex-grow"
                placeholder="Add a feature"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addFeature()}
              />
              <button className="btn btn-primary" onClick={addFeature}>
                <FiPlus /> Add
              </button>
            </div>
          </div>
          <div className="modal-action">
            <label
              htmlFor={isNew ? "newitem_modal" : "edititem_modal"}
              className="btn"
            >
              Cancel
            </label>
            <label
              htmlFor={isNew ? "newitem_modal" : "edititem_modal"}
              className="btn btn-primary"
              onClick={onSave}
            >
              {isNew ? "Create" : "Save"}
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
