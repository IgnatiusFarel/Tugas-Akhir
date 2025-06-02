import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import menuSidebar from "../components/layout/MenuSidebar";

const useMenuSidebar = () => {
  const location = useLocation();
  const [activeMenuSidebar, setActiveMenuSidebar] = useState(null);

  useEffect(() => {
    const activeItem = menuSidebar.find((item) => {
      if (item.children) {
        const subMenuItem = item.children.find(
          (subItem) => subItem.link === location.pathname
        );
        if (subMenuItem) {
          setActiveMenuSidebar(subMenuItem);
          return true;
        }
      }
      return item.link === location.pathname;
    });

    if (activeItem && !activeItem.children) {
      setActiveMenuSidebar(activeItem);
    }
  }, [location.pathname]);

  return { activeMenuSidebar, menuSidebar, setActiveMenuSidebar };
};

export default useMenuSidebar;
