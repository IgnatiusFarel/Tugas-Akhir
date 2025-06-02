import {
  Avatar,
  Breadcrumb,
  Button,
  Dropdown,
  Layout,
  Menu,
  Typography,
} from "antd";
import { useCallback, useState } from "react";
import {
  ExpandAltOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import useMenuSidebar from "../../hooks/useMenuSidebar";
import Logo from "../../assets/DIGITEFA.svg"
import useBreadcrumbs from "../../hooks/useBreadcrumbs"

const { Header, Sider } = Layout;
const { Text } = Typography;

const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const {  activeMenuSidebar, menuSidebar } = useMenuSidebar();
  const { breadcrumbItems } = useBreadcrumbs();

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prevCollapsed) => !prevCollapsed);
  }, []);

  const onLogout = useCallback(() => {});

  const menuNavbar = (
    <Menu>
      <Menu.Item onClick={onLogout}>
        <div className="flex items-center text-red-500">
          <LogoutOutlined className="size-5 mr-2" /> Logout
        </div>
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: "100vh" }} className="flex">
      <Sider
        className="hidden md:inline-block"
        trigger={null}
        collapsible
        width={275}
        collapsed={collapsed}
        breakpoint="lg"
        theme="light"
        style={{
          borderRight: "1px solid #E9E9E9",
          height: "100%",
          overflow: "auto",
          position: "sticky",
          top: 0,
        }}
      >
        <div className="top-0 sticky h-screen">
          <div className="flex justify-center py-7">
            <img src={Logo} alt="Logo" className="w-48"/>
          </div>
          <div className="menu-title"
          style={{ padding: "0 32px", marginBottom: "8px"}}
          >
            <h5 className="text-xs font-medium text-[#BBB]"> MAIN MENU</h5>
          </div>
          <Menu
            mode="inline"
            defaultOpenKeys={[breadcrumbItems?.[1].key]}
            defaultSelectedKeys={[activeMenuSidebar?.key]}
            selectedKeys={[activeMenuSidebar?.key]}
            items={menuSidebar}

          />
        </div>
      </Sider>

      <Layout>
        <Header
          className="site-layout-background top-0 sticky z-50"
          style={{
            padding: 0,
            background: "#FFF",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #E9E9E9",
            height: "90px",
          }}
        >
          <div className="flex flex-row">
            <div className="flex items-center">
              <Button
              type="link"
              onClick={toggleCollapsed}
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                }}
              >                
                {collapsed ? (
                  <MenuUnfoldOutlined className="text-xl text-gray-800 hover:text-black size-6" />
                ) : (
                  <MenuFoldOutlined className="text-xl text-gray-800 hover:text-black size-6" />
                )}
              </Button>
            </div>
            <div className="flex flex-col">
            <Breadcrumb>{breadcrumbItems}</Breadcrumb>
            <Text className="text-lg font-medium md:text-2xl md:font-medium" >
              {activeMenuSidebar?.text}
            </Text>
          </div>
          </div>

          <div className="flex items-center mr-4">
            <Dropdown
              overlay={menuNavbar}
              trigger={["click"]}
              getPopupContainer={(trigger) => trigger.parentElement}
            >
              <Button
                className="flex items-center bg-gray-100 hover:bg-gray-400 p-8 rounded-xl focus:outline-none focus:shadow-outline hidden sm:flex"
                shape="round"
              >
                <div className="flex items-center justify-between w-full">
                  <Avatar
                    src="https://img.freepik.com/free-photo/3d-portrait-people_23-2150793852.jpg?semt=ais_hybrid"
                    size={36}
                    className="mr-2"
                  />
                  <div className="flex flex-col items-start mr-2">
                    <Text style={{fontSize: "14px"}}> Tugas Akhir</Text>
                    <Text style={{fontSize: "12px"}}> Superadmin </Text>
                  </div>
                  <ExpandAltOutlined className="size-5" />
                </div>
              </Button>
            </Dropdown>
          </div>
        </Header>
        {children}
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
