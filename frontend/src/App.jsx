import { ConfigProvider } from "antd";
import Index from "./routes/Index"

const App = () => {
  return (
  <ConfigProvider
  theme={{
    token: {
      fontFamily: "Poppins, sans-serif",
      colorPrimary: "#dc362e"
    },
    components: {
      Menu: {
        itemHeight: 60,
        colorBgTextActive: "#dc362e",
        colorIconHover: "#dc362e",
        itemHoverColor: "#dc362e",
        itemSelectedColor: "#dc362e",
        itemBg: "#fff",
        subMenuItemBg: "#fff"
      },
      Table: {
        cellPaddingBlock: 20,
        rowHoverBg: "#f4f4f4",
        rowSelectedBg: "#f4f7fe",
        headerBg: "#f9f9f9",
        headerBorderRadius: 10,
        
      }
    }
  }}>

    <Index />
  </ConfigProvider> 
  )
};

export default App;
