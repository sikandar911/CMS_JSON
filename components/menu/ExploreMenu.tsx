"use client"

import Link from "next/link";

interface MenuItem {
  name: string;
  url: string;
}

interface ExploreMenuProps {
  menuData: MenuItem[];
  onButtonMenu: (item: string) => void;
}

export default function ExploreMenu({ menuData, onButtonMenu }: ExploreMenuProps) {
  return (
    <>
      {menuData.map((menu, index) => {
        return (
          <Link
            href={menu.url || "#"}
            className={"text-primary hover:text-secondary px-2 py-4"}
            key={index}
            onClick={() => onButtonMenu('')}
          >
            {menu.name}
          </Link>
        )
      })}
    </>
  );
}
