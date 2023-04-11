import React from 'react';
import { Link, useLocation } from 'react-router-dom'
import {Breadcrumb} from 'antd'
import {HomeOutlined} from "@ant-design/icons";

function BreadCrumb(props) {

    const location = useLocation();

    const breadCrumbView = () => {
        const { pathname } = location;
        const pathnames = pathname.split("/").filter(item => item);

        const items = pathnames.map((path, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;

            return {
                title: <Link to={routeTo}>{path}</Link>,
            };
        });

        if (pathnames.length === 0) {
            items.push({ title: <Link to="/">dashboard</Link> });
        }

        return (
            <Breadcrumb className="px-8 pt-4" style={{ marginTop: "68px" }} items={items} />
        );
    };
    return (
        <>{breadCrumbView()}</>
    )
}

export default BreadCrumb;
