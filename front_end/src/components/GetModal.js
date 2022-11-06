/* eslint-disable guard-for-in */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import {Modal, Button, List, Avatar, message} from 'antd';
import React, {useEffect, useState} from 'react';
import {InputNumber} from 'antd';
const GetModal = ({open, setOpen, name})=>{
  const [candies, setCandies] = useState([]);
  const [dict, setDict] = useState({});
  const [total, setTotal] = useState(0);
  const [point, setPoint] = useState(0);
  const [disable, setDisable] = useState(false);
  const [hobby, setHobby] = useState([]);

  const getListOfCandies = async ()=>{
    const data1 = await fetch('https://candy-api-2022.herokuapp.com/candy', {
      method: 'GET',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
    });
    const response1 = await data1.json();

    const data2 = await fetch('https://candy-api-2022.herokuapp.com/user', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: JSON.stringify({
        name: name,
      }),
    });

    const response2 = await data2.json();
    const user = response2.information[0];
    setHobby(user.hobby);
    setPoint(user.point);
    if (user.point==0) {
      setDisable(true);
    }
    for (const index in response1.listOfCandies) {
      const nameCandy = response1.listOfCandies[index].type;
      const updatedValue ={};
      updatedValue[nameCandy] = 0;
      setDict((dict)=>({
        ...dict,
        ...updatedValue,
      }));
    };
    setCandies(response1.listOfCandies);
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
    if (total>point) {
      message.warning({
        content: 'You can only take out '+ point + ' candies.',
        className: 'custom-class',
        style: {
          marginTop: '20vh',
        },
        duration: 3,
      });
      setDisable(true);
    } else {
      setDisable(false);
    }
    setTotal(total);
  };

  const exchange = async ()=>{
    const data = await fetch('https://candy-api-2022.herokuapp.com/candy', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: JSON.stringify({
        type: 2,
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
      setDisable(false);
    }
  }, [open]);
  return (
    <Modal open={open} width="700px" onCancel={()=>{
      setOpen(false);
    }}
    footer={
      [
        <Button key="submit" type="primary" onClick={exchange} disabled={disable}
          style={{borderRadius: '5px', fontWeight: 'bold', display: 'block', marginLeft: 'auto', marginRight: 'auto'}}
        >
            Get
        </Button>,
      ]
    }>
      <p style={{fontWeight: 'bold', fontSize: '25px'}}>You can get {point} candies. Happy Halloween!</p>
      <List
        style={{height: '380px', overflow: 'auto'}}
        itemLayout="horizontal"
        dataSource={candies}
        renderItem={(item) => (
          <List.Item>
            {
              hobby.includes(item.type) ? <List.Item.Meta
                avatar={<Avatar src={item.image} />}
                title={<p style={{fontWeight: 'bolder'}}>{item.type} (Your favorite candy)</p>}
                description={'Remaining: ' + item.number}
              />: <List.Item.Meta
                avatar={<Avatar src={item.image} />}
                title={<p>{item.type}</p>}
                description={'Remaining: ' + item.number}
              />
            }
            <InputNumber min={0} max={item.number} onChange={onChange(item.type)} value={dict[item.type]} />
          </List.Item>
        )}
      />
      <p style={{textAlign: 'center', fontWeight: 'bold', fontSize: '20px'}}>Candies total exchange: {total}</p>
    </Modal>
  );
};

export default GetModal;
