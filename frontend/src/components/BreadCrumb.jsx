import React from 'react';
import { NavLink, useLocation } from 'react-router-dom'
import {Breadcrumb} from 'antd'
import {HomeOutlined} from "@ant-design/icons";

function BreadCrumb(props) {

    const location = useLocation();

    const breadCrumbView = () => {
        const { pathname } = location;
        const pathnames = pathname.split("/").filter(item => item);


        return (
            <Breadcrumb className="px-8 pt-4" style={{marginTop:"68px"}}>
                {pathnames.length >0 ? (
                    <Breadcrumb.Item><NavLink to={"/"}><HomeOutlined /></NavLink></Breadcrumb.Item>
                ) : (<Breadcrumb.Item>Dashboard</Breadcrumb.Item>)}
                {pathnames.map((path, index) => {
                    const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
                    const isLast = index === pathnames.length - 1;
                    return isLast ? (
                        <Breadcrumb.Item key={index}>{path}</Breadcrumb.Item>
                    ) : (
                        <Breadcrumb.Item key={index}><NavLink to={`${routeTo}`}>{path}</NavLink></Breadcrumb.Item>
                    )
                })}
            </Breadcrumb>
        )
    }

    return (
        <>{breadCrumbView()}</>
    )
}

export default BreadCrumb;
