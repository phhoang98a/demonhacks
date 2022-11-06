/* eslint-disable guard-for-in */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import {Modal, Button, List, Avatar} from 'antd';
import React, {useEffect, useState} from 'react';
import {InputNumber} from 'antd';
const ExchangeModal = ({open, setOpen, name})=>{
  const [candies, setCandies] = useState([]);
  const [dict, setDict] = useState({});
  const [total, setTotal] = useState(0);

  const getListOfCandies = async ()=>{
    const data = await fetch('https://candy-api-2022.herokuapp.com/candy', {
      method: 'GET',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
    });
    const response = await data.json();
    for (const index in response.listOfCandies) {
      const nameCandy = response.listOfCandies[index].type;
      const updatedValue ={};
      updatedValue[nameCandy] = 0;
      setDict((dict)=>({
        ...dict,
        ...updatedValue,
      }));
    };
    setCandies(response.listOfCandies);
  };

  const onChange = (name) => async (value) => {
    const updatedValue ={};
    updatedValue[name]=value;
    const oldDict = dict;
    oldDict[name] = value;
    setDict((dict)=>({
      ...dict,
      ...updatedValue,
    }));
    let total = 0;
    for (const candy in dict) {
      total = total +oldDict[candy];
    };
    setTotal(total);
  };

  const exchange = async ()=>{
    const data = await fetch('https://candy-api-2022.herokuapp.com/candy', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: JSON.stringify({
        type: 1,
        total: total,
        name: name,
        listCandies: dict,
      }),
    });
    setOpen(false);
  };

  useEffect(()=>{
    if (open===true) {
      setDict({});
      setTotal(0);
      getListOfCandies();
    }
  }, [open]);
  return (
    <Modal open={open} width="700px" onCancel={()=>{
      setOpen(false);
    }}
    footer={
      [
        <Button key="submit" type="primary" onClick={exchange}
          style={{borderRadius: '5px', fontWeight: 'bold', display: 'block', marginLeft: 'auto', marginRight: 'auto'}}
        >
            Exchange
        </Button>,
      ]
    }>
      <p style={{fontWeight: 'bold', fontSize: '25px'}}>What do you have? Please exchange candies with me.</p>
      <List
        style={{height: '380px', overflow: 'auto'}}
        itemLayout="horizontal"
        dataSource={candies}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={item.image} />}
              title={<p>{item.type}</p>}
            />
            <InputNumber min={0} max={10000} onChange={onChange(item.type)} value={dict[item.type]} />
          </List.Item>
        )}
      />
      <p style={{textAlign: 'center', fontWeight: 'bold', fontSize: '20px'}}>Candies total exchange: {total}</p>
    </Modal>
  );
};

export default ExchangeModal;
