import React from 'react'; // react
import ReactDOM from 'react-dom' // dom
import {Input, AutoComplete, List, Space, Tabs} from 'antd'; // antd渲染
import DynamicAntdTheme from 'dynamic-antd-theme'; //动态主题
import './index.css'; 
import * as _ from 'underscore'; // 节流 

const { TabPane } = Tabs;

class Search extends React.Component {
  constructor(props) {
    super(props)
    /*
    * state用来存储动态信息
    */
    this.state = {
      keyword: '', // 输入关键词
      options: [], // 关键词推荐列表
      searchResults: [], // 搜索结果列表
      index: -1, // 当前选项
      current: 1, //当前页地址
      size: 0 // 搜索结果总数
    }
    this.handleInputThrottled = _.throttle(this.onSearch, 1000)
  }

  
  componentDidMount(e) {
    this.setState({
      keyword: this.value,
      size: this.total,
      searchResults: this.list
    })
  }

  // 获得关键字列表
  getOptions = (params) => {
    const xhr = new XMLHttpRequest();
    xhr.open('get', `https://i.snssdk.com/search/api/sug/?keyword=${params}`, true);
    xhr.responseType = 'json';
    xhr.send();
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) {
          return;
        }
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
            const res = xhr.response.data;
            let params = [];
            res.forEach((item) => {
                params.push({value: item.keyword});
            });
            // console.log(this.state.keyword)
            this.setState({
              options: params
            });
        } else {
            return new Error(xhr.statusText);
        }
      }
  }

  // 获得搜索结果
  getsearchResults = (params) => {
    const xhr = new XMLHttpRequest();
    xhr.open('get', `https://i.snssdk.com/search/api/study?keyword=${params.keyword}&offset=${params.offset}`, true);
    xhr.responseType = 'json';
    xhr.send();
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) {
          return;
        }
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
            const res = xhr.response.data;
            let list = []
            res.forEach((item) => {
              list.push(item)
            })
            this.setState({
              searchResults: list,
              size: xhr.response.total
            });
        } else {
            return new Error(xhr.statusText);
        }
      }
  }

  // 搜索推荐词
  onSearch = (keyword) => {
    if(keyword.length !== 0) {
      this.getOptions(keyword);
    }
  };

  // 选中词时调用
  onSelect = (keyword) => {
    if(keyword.length !== 0) {
      this.getsearchResults({
        keyword: keyword,
        offset: 0
      });
    }
  };

  // 选中或输入搜索词时调用
  onChange = keyword => {
    this.setState({
      keyword : keyword
    });
  };

  handleKeyUp= (e)=>{
    let keyCode = e.keyCode;
    if (keyCode === 38 || keyCode === 40) {
        if (keyCode === 38){
            this.setState({index:this.state.index-1})
            if (this.state.index<0){
                this.setState({index:this.state.options.length-1});
            }
            //根据上下键切换，则给表单时面赋不同的值
            e.target.value=this.state.options[this.state.index+1];
            this.setState({val:e.target.value});
        } else {
            this.setState({index:this.state.index+1})
            if (this.state.index >= this.state.options.length-1) {
                this.setState({index:-1});
            }
            //根据上下键切换，则给表单时面赋不同的值
            e.target.value=this.state.options[this.state.index+1];
            this.setState({val:e.target.value});
        }
    }
  }


  pageChange = (page) => {
    this.getsearchResults({
      keyword: this.state.keyword,
      offset: page-1
    });
    this.setState({
      current: page
    })
  }

  // 页面部署
  render () {
    const {
      keyword,
      options,
      searchResults,
      size,
      current
    } = this.state
    return (
      <div className="container">
        {/* 动态更换主题 */}
        <DynamicAntdTheme />

        {/* 搜索框部分 */}
        <div className="bar">
          <AutoComplete
            value={keyword}
            options={options}
            style={{
              width: 900,
            }}
            onSelect={this.onSelect}
            onSearch={this.onSearch}
            onChange={this.onChange}
            onKeyUp={this.handleKeyUp}
            autoFocus
          >
            <Input.Search 
              size="large" 
              placeholder={keyword ? keyword : "头条简易搜索框"}
              onSearch={this.onSelect}
              enterButton="搜索" 
            />
          </AutoComplete>

          {/* 搜索结果部分 */}
          <Tabs 
            ActiveKey="1" 
            size="large" 
            style={{
              backgroundColor: 'beige',
            }}
          >
            <TabPane tab="搜索结果" key="1" width='120' >
            <div className="list">
              <List
                current={current}
                itemLayout="vertical"
                size="large"
                pagination={{
                  total: size,
                  onChange: this.pageChange,
                  pageSize: 10,
                }}
                style={{
                  backgroundColor: 'beige'
                }}
                dataSource={searchResults}
                renderItem={item => (
                  <List.Item
                    actions={[  
                      <Space>
                        作者:{<a href={item.link_url} target="_blank">{item.user_name}</a>}
                        评论数:{item.comments_count}
                        发表时间:{new Date(item.create_time).toLocaleString()}
                      </Space>
                    ]}
                  >
                    <List.Item.Meta
                      title={<a href={item.link_url} target="_blank">{item.title}</a>}
                      description={<p>{item.description}<a href={item.link_url} target="_blank">详情</a></p>}
                    />
                  </List.Item>
                  )}
              />
            </div>
            </TabPane>
          </Tabs>
        </div>
        
      </div>
    );
  } 
};


ReactDOM.render(
    <Search />,
  document.getElementById('search')
);
