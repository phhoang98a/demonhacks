/* eslint-disable guard-for-in */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import {Modal, Input, Button, Avatar, Row, Col, Tag, Tooltip, message} from 'antd';
import React, {useEffect, useState} from 'react';
import {UserOutlined, CameraOutlined} from '@ant-design/icons';
import Webcam from 'react-webcam';

const NewUserInfomation = ({open, setOpen, setCamera})=>{
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [images, setImages] = useState([]);
  const [candies, setCandies] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const {CheckableTag} = Tag;

  const getListOfCandies = async ()=>{
    const data = await fetch('https://candy-api-2022.herokuapp.com/candy', {
      method: 'GET',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
    });
    const response = await data.json();
    const listCandies = [];
    for (const index in response.listOfCandies) {
      const nameCandy = response.listOfCandies[index].type;
      listCandies.push(nameCandy);
    };
    setCandies(listCandies);
  };

  const videoConstraints = {
    facingMode: 'user',
  };

  useEffect(()=>{
    if (open===true) {
      setCamera(false);
      getListOfCandies();
      setSelectedTags([]);
      setEmail('');
      setUsername('');
    }
  }, [open]);

  const handleChange = (tag, checked) => {
    const nextSelectedTags = checked ?
      [...selectedTags, tag] :
      selectedTags.filter((t) => t !== tag);
    console.log('You are interested in: ', nextSelectedTags);
    setSelectedTags(nextSelectedTags);
  };

  const Login = async () =>{
    if (username==='' || email==='' || images.length===0) {
      let mess = '';
      if (username==='') {
        mess = 'Please put in an username';
      }
      if (email==='') {
        mess = 'Please put in an email';
      }
      if (images.length===0) {
        mess = 'Please take one picture of yourself';
      }
      message.warning({
        content: mess,
        className: 'custom-class',
        style: {
          marginTop: '20vh',
        },
        duration: 3,
      });
    } else {
      const data = await fetch('https://candy-api-2022.herokuapp.com/signup', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: JSON.stringify({
          username: username,
          email: email,
          image: images,
          hobby: selectedTags,
        }),
      });
      const response = await data.json();
      if (response.status===200) {
        message.success({
          content: response.msg,
          className: 'custom-class',
          style: {
            marginTop: '20vh',
          },
          duration: 3,
        });
        setCamera(true);
        setOpen(false);
      } else {
        message.warning({
          content: response.msg,
          className: 'custom-class',
          style: {
            marginTop: '20vh',
          },
          duration: 3,
        });
      }
    }
  };

  return (
    <Modal open={open} width="700px" onCancel={()=>{
      setOpen(false);
      setCamera(true);
      setImages([]);
    }}
    footer={[<Button key="submit" type="primary" onClick={Login}
      style={{borderRadius: '5px', fontWeight: 'bold', display: 'block', marginLeft: 'auto', marginRight: 'auto'}}
    >
    Add profile
    </Button>]}>
      <Row>
        <Col span={6}>
          {
            images.length ==0 ?
            <Avatar
              style={{marginTop: '20px'}}
              size={150}
              icon={<UserOutlined />}
            />:<Avatar
              style={{marginTop: '20px'}}
              size={150}
              src={images[0]}
            />

          }
        </Col>
        <Col span={18}>
          <Input placeholder="Username" value={username} style={{marginTop: '40px', marginBottom: '20px', width: '80%'}} onChange={(e)=>setUsername(e.target.value)}/>
          <Input placeholder="Email" value={email} style={{marginBottom: '20px', width: '80%'}} onChange={(e)=>setEmail(e.target.value)}/>
          <div>
            <span style={{marginRight: 8}}><b>Hobby</b>:</span>
            {candies.map((candy) => (
              <CheckableTag
                key={candy}
                checked={selectedTags.indexOf(candy) > -1}
                onChange={(checked) => handleChange(candy, checked)}
              >
                {candy}
              </CheckableTag>
            ))}
          </div>
          <div style={{position: 'relative', marginTop: '10px'}}>
            <Webcam
              audio={false}
              screenshotFormat="image/jpeg"
              width="70%"
              videoConstraints={videoConstraints}
            >
              {({getScreenshot}) => (
                <Tooltip title='Capture'>
                  <CameraOutlined
                    style={{position: 'absolute', zIndex: 10000, bottom: '10px', right: '60%', fontSize: '50px', color: 'white'}}
                    onClick={() => {
                      const dataUri = getScreenshot();
                      setImages([dataUri]);
                    }}/>
                </Tooltip>
              )}
            </Webcam>
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default NewUserInfomation;
