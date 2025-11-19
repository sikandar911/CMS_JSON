"use client";

import { useState } from "react";
import Link from "next/link";
import classNames from "classnames";

interface SubMenuItem {
  name: string;
  url: string;
}

interface MenuItem {
  name: string;
  url?: string;
  subMenu?: SubMenuItem[];
}

interface MobileMenuProps {
  menuData: MenuItem[];
  openMenu: string;
  setOpenMenu: (menu: string | undefined) => void;
}

const buttonData = {
  signInButton: {
    text: "Sign In",
    url: "",
    classes:
      "bg-primary border-white text-white gap-2 py-2 pl-2 pr-5 font-semibold leading-5 inline-flex items-center justify-center rounded-full whitespace-nowrap",
  },
  bookFreeConsultationButton: {
    text: "Book Free Consultation",
    url: "",
    classes:
      "text-color bg-white text-default border-white gap-2 py-2 pl-2 pr-5 font-semibold leading-5 inline-flex items-center justify-center rounded-full whitespace-nowrap",
  },
};

export default function MobileMenu({ menuData, openMenu, setOpenMenu }: MobileMenuProps) {
  const [activeMenu, setActiveMenu] = useState<number | undefined>(undefined);

  const handleClick = (e: React.MouseEvent, index: number) => {
    if (activeMenu === index) {
      setActiveMenu(undefined);
    } else {
      setActiveMenu(index);
    }
  };

  const handleCloseMenu = () => {
    setActiveMenu(undefined);
    setOpenMenu(undefined);
  };

  return (
    <div
      className={classNames("mobile-menu p-10 relative", {
        "show-menu": openMenu === "mobileMenu",
      })}
    >
      <div className="mr-10">
        <ul className="flex flex-col gap-3">
          {menuData.map((menu, index) => {
            return (
              <li key={index}>
                {menu.subMenu ? (
                  <>
                    <div
                      className={classNames(
                        "flex gap-3 text-white font-semibold hover:text-secondary-400 cursor-pointer",
                        { "active-menu": activeMenu === index + 1 }
                      )}
                      onClick={(event) => {
                        handleClick(event, index + 1);
                      }}
                    >
                      {menu.name}
                      <span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M6 9l6 6 6-6"></path>
                        </svg>
                      </span>
                    </div>
                    <ul
                      className={classNames("mt-2 ml-3 hidden", {
                        "open-menu": activeMenu === index + 1,
                      })}
                    >
                      {menu.subMenu.map((subMenu, subIndex) => {
                        return (
                          <li key={subIndex}>
                            <Link
                              href={subMenu.url || "#"}
                              className={
                                "text-[14px] font-medium text-white hover:text-secondary"
                              }
                              onClick={() => handleCloseMenu()}
                            >
                              {subMenu.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                ) : (
                  <Link
                    href={menu.url || "#"}
                    className={"text-white font-semibold hover:text-secondary"}
                    onClick={() => handleCloseMenu()}
                  >
                    {menu.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        <div className="mb-6" />
        <div className="flex">
          <Link
            href={buttonData.signInButton.url || "#"}
            className={buttonData.signInButton.classes}
          >
            {buttonData.signInButton.text}
          </Link>
        </div>
        <div className="mb-5" />
        <div className="flex">
          <Link
            href={buttonData.bookFreeConsultationButton.url || "#"}
            className={buttonData.bookFreeConsultationButton.classes}
            onClick={() => handleCloseMenu()}
          >
            {buttonData.bookFreeConsultationButton.text}
          </Link>
        </div>
      </div>

      <button
        className="absolute top-4 right-4 p-2 bg-white text-[#263238] hover:bg-natural-200 hover:text-warning rounded-full cursor-pointer"
        onClick={() => handleCloseMenu()}
        title="Close menu"
        aria-label="Close menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <rect width="24" height="24" rx="12" fill="none" />
          <path
            d="M16.8057 6.54785L6.35365 16.9999"
            stroke="currentColor"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M6.54785 6.35352L16.9999 16.8055"
            stroke="currentColor"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
