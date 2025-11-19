"use client";

import { Fragment } from "react";
import Link from "next/link";

interface MenuLink {
  name: string;
  url: string;
}

interface MenuItem {
  title: string;
  menuLinks: MenuLink[];
}

interface MenuButtons {
  classes: string;
  text: string[];
  url: string[];
  icon?: {
    src: string;
    alt: string;
  };
}

interface StudentMenuData {
  menuItems: MenuItem[];
  menuButtons: MenuButtons;
}

interface StudentMenuProps {
  menuData: StudentMenuData;
  onButtonMenu: (item: string) => void;
}

export default function StudentMenu({ menuData, onButtonMenu }: StudentMenuProps) {
  const { menuItems, menuButtons } = menuData;

  return (
    <div className="flex w-full justify-between gap-x-4">
      {menuItems.map((item, itemIndex) => {
        return (
          <div key={itemIndex} className="mr-[70px]">
            <div className="text-primary border-b-2 border-default-600 font-bold mb-3">{item.title}</div>
            <div className="flex flex-col gap-2">
              {item.menuLinks.map((link, index) => {
                return (
                  <div key={index}>
                    <Link
                      href={link.url || "#"}
                      className={"text-primary hover:text-secondary py-4"}
                      onClick={() => onButtonMenu('')}
                    >
                      {link.name}
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
      
      <div className="flex flex-col flex-wrap gap-4">
        {menuButtons.text.map((text, index) => {
          return (
            <Fragment key={index}>
              <Link
                href={menuButtons.url[index] || "#"}
                className={menuButtons.classes}
                onClick={() => onButtonMenu('')}
              >
                {text}
              </Link>
            </Fragment>
          )
        })}
      </div>
    </div>
  );
}
