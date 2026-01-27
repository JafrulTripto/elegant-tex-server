import React from 'react';
import { Link, useLocation } from 'react-router-dom'
import { Breadcrumb } from 'antd'
import { HomeOutlined } from '@ant-design/icons';

function BreadCrumb(props) {

    const location = useLocation();

    const breadCrumbView = () => {
        const { pathname } = location;
        const pathnames = pathname.split("/").filter(item => item);
        const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

        const items = [
            {
                title: <Link to="/"><HomeOutlined /></Link>
            }
        ];

        pathnames.forEach((path, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;
            const isId = /^\d+$/.test(path);
            const title = isId ? `#${path}` : capitalize(path);

            items.push({
                title: isLast ? <span>{title}</span> : <Link to={routeTo}>{title}</Link>,
            });
        });

        return (
            <Breadcrumb items={items} className="mb-2" />
        );
    };
    return (
        <>{breadCrumbView()}</>
    )
}

export default BreadCrumb;
