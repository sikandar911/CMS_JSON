"use client";

import { useEffect, useState } from "react";
import classNames from "classnames";
import Link from "next/link";
import Image from "next/image";

import ExploreMenu from "./menu/ExploreMenu";
import StudentMenu from "./menu/StudentMenu";
import MobileMenu from "./menu/MobileMenu";

// Header data with blank URLs
const headerData = {
  mainMenu: [
    {
      name: "Explore",
      subMenu: "explore",
    },
    {
      name: "For Students",
      subMenu: "student",
    },
    {
      name: "Courses",
      url: "",
    },
    {
      name: "For Institutes",
      url: "",
    },
  ],

  explore: [
    {
      name: "Explore Courses",
      url: "",
    },
    {
      name: "UAPP Platform",
      url: "",
    },
    {
      name: "Are you a student?",
      url: "",
    },
    {
      name: "Are you an institute?",
      url: "",
    },
    {
      name: "Are you a consultant?",
      url: "",
    },
  ],

  student: {
    menuItems: [
      {
        title: "Our Services",
        menuLinks: [
          {
            name: "Explore Courses",
            url: "",
          },
          {
            name: "Explore Accommodation",
            url: "",
          },
          {
            name: "Explore Study Loans",
            url: "",
          },
        ],
      },
      {
        title: "UK/EU Students",
        menuLinks: [
          {
            name: "When to Apply?",
            url: "",
          },
          {
            name: "How to Apply?",
            url: "",
          },
          {
            name: "What to do next?",
            url: "",
          },
        ],
      },
      {
        title: "International Students",
        menuLinks: [
          {
            name: "When to Apply?",
            url: "",
          },
          {
            name: "How to Apply?",
            url: "",
          },
          {
            name: "Take your next Step",
            url: "",
          },
        ],
      },
      {
        title: "Study Destinations",
        menuLinks: [
          {
            name: "UK",
            url: "",
          },
        ],
      },
    ],
    menuButtons: {
      classes:
        "group primary-button bg-transparent text-primary border-primary flex-row-reverse gap-2 py-[10px] px-4 font-medium hover:bg-primary hover:text-white",
      text: ["Explore More", "UAPP Platform"],
      url: ["", ""],
      icon: {
        src: "",
        alt: "icon",
      },
    },
  },
  
  moreOptions: [
    {
      name: "UAPP Platform",
      url: "",
    },
    {
      name: "Our Story",
      url: "",
    },
    {
      name: "Consultants",
      url: "",
    },
    {
      name: "Affiliates",
      url: "",
    },
    {
      name: "Careers",
      url: "",
    },
    {
      name: "Blogs",
      url: "",
    },
    {
      name: "Events",
      url: "",
    },
  ],
  
  mobileMenu: [
    {
      name: "Explore",
      subMenu: [
        {
          name: "Explore Courses",
          url: "",
        },
        {
          name: "UAPP Platform",
          url: "",
        },
        {
          name: "Are you a student?",
          url: "",
        },
        {
          name: "Are you an institute?",
          url: "",
        },
        {
          name: "Are you a consultant",
          url: "",
        },
      ],
    },
    {
      name: "For Student",
      url: "",
    },
    {
      name: "For Institutes",
      url: "",
    },
    {
      name: "Courses",
      url: "",
    },
    {
      name: "More",
      subMenu: [
        {
          name: "UAPP Platform",
          url: "",
        },
        {
          name: "Our Story",
          url: "",
        },
        {
          name: "Consultants",
          url: "",
        },
        {
          name: "Affiliates",
          url: "",
        },
        {
          name: "Careers",
          url: "",
        },
        {
          name: "Blogs",
          url: "",
        },
        {
          name: "Events",
          url: "",
        },
      ],
    },
  ],
};

const buttonData = {
  signInButton: {
    text: "Sign In",
    url: "",
    target: "_blank",
    classes:
      "bg-primary border-white text-white gap-2 py-2 pl-2 pr-5 font-semibold leading-5 inline-flex items-center justify-center rounded-full whitespace-nowrap",
    icon: {
      src: "",
      alt: "sign in icon",
    },
  },
  bookFreeConsultationButton: {
    text: "Book Free Consultation",
    url: "",
    classes:
      "text-color bg-white text-default border-white gap-2 py-2 pl-2 pr-5 font-semibold leading-5 inline-flex items-center justify-center rounded-full whitespace-nowrap",
    icon: {
      src: "",
      alt: "call icon",
    },
  },
};

export default function Header() {
  const [openMenu, setOpenMenu] = useState("");
  const [active, setActive] = useState<number | undefined>(undefined);
  const [scrolling, setScrolling] = useState(false);

  const handleMenu = (event: React.MouseEvent, index: number, item = "") => {
    item && event.preventDefault();

    if (openMenu === item) {
      setOpenMenu("");
    } else {
      setOpenMenu(item);
    }

    setActive(index);
  };

  const handleButtonMenu = (item: string) => {
    if (openMenu === item) {
      setOpenMenu("");
    } else {
      setOpenMenu(item);
      setActive(undefined);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      // treat any scroll greater than 0 as "start scrolling"
      if (window.scrollY > 0) {
        setScrolling(true);
      } else {
        setScrolling(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
  // fixed transparent header so hero can sit behind it. 'has-scroll' will provide shadow when user scrolls.
  <div className={`fixed top-0 left-0 right-0 z-50 ${scrolling ? "header-scrolled has-scroll" : "bg-transparent"}`}>
      <div className="container mx-auto py-3">
        <div className="flex md:flex-row justify-between items-center">
          <div>
            <Link href="/">
              <Image
                src="/uapp-logo.svg"
                alt="Uapp Logo"
                width={174}
                height={48}
                priority
              />
            </Link>
          </div>

          <div className="hidden lg:block">
            <div className="flex items-center gap-y-3 gap-x-2">
              {headerData.mainMenu.map((menu, index) => {
                const activeClass =
                  active && active == index + 1 ? "active-menu" : "";

                return (
                  <Link
                    href={menu.url ? menu.url : "#"}
                    className={`menu-item relative text-white hover:text-secondary-400 text-center p-2 ${activeClass}`}
                    key={index}
                    onClick={(event) =>
                      handleMenu(event, index + 1, menu.subMenu)
                    }
                  >
                    {menu.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className=" flex flex-row items-center gap-3">
              <button
                className={classNames(
                  "w-12 h-12 flex justify-center items-center border rounded-full text-white hover:text-secondary-400 hover:border-secondary-400",
                  { "active-menu-button": openMenu === "moreOptions" }
                )}
                onClick={() => handleButtonMenu("moreOptions")}
                title="More options menu"
                aria-label="More options menu"
              >
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
                  <path d="M3 12h18M3 6h18M3 18h18"></path>
                </svg>
              </button>

              {/* Sign In - dark pill with white circular icon on the left */}
              <Link
                href={buttonData.signInButton.url || "#"}
                target={buttonData.signInButton.target}
                onClick={() => handleButtonMenu("")}
                className="inline-flex items-center gap-3 rounded-full px-4 py-2 bg-[#045D5E] text-white font-semibold"
              >
                <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                  {/* user icon (dark) */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#045D5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
                <span>{buttonData.signInButton.text}</span>
              </Link>

              {/* Book Free Consultation - white pill with colored circular icon */}
              <Link
                href={buttonData.bookFreeConsultationButton.url || "#"}
                onClick={() => handleButtonMenu("")}
                className="inline-flex items-center gap-3 rounded-full px-4 py-2 bg-white text-[#045D5E] font-semibold"
              >
                <span className="w-8 h-8 rounded-full bg-[#045D5E] flex items-center justify-center text-white">
                  {/* phone icon (white) */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.07 8.81 19.86 19.86 0 0 1 0 0.18 2 2 0 0 1 2 0h3a2 2 0 0 1 2 1.72c.12 1.05.36 2.08.72 3.05a2 2 0 0 1-.45 2.11L6.91 8.91a16 16 0 0 0 8.18 8.18l1.03-1.03a2 2 0 0 1 2.11-.45c.97.36 2 .6 3.05.72A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </span>
                <span>{buttonData.bookFreeConsultationButton.text}</span>
              </Link>
            </div>
          </div>

          <div className="block lg:hidden">
            <button
              className={classNames(
                "w-[52px] h-[52px] flex justify-center items-center border rounded-full text-white hover:text-secondary-400 hover:border-secondary-400",
                { "active-menu-button": openMenu === "moreOptions" }
              )}
              onClick={() => handleButtonMenu("mobileMenu")}
              title="Mobile menu"
              aria-label="Open mobile menu"
            >
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
                <path d="M3 12h18M3 6h18M3 18h18"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {openMenu &&
        (openMenu === "mobileMenu" ? (
          <></>
        ) : (
          <>
            <div
              className="fixed top-0 left-0 right-0 bottom-0 -z-10"
              onClick={() => handleButtonMenu("")}
            ></div>
            <div className="popup-bg relative">
              <div className="container mx-auto">
                <div className="flex flex-wrap justify-between g-2 py-5">
                  {(openMenu === "explore" || openMenu === "moreOptions") && (
                    <ExploreMenu
                      menuData={headerData[openMenu]}
                      onButtonMenu={(item: string) => handleButtonMenu(item)}
                    />
                  )}
                  {openMenu === "student" && (
                    <StudentMenu
                      menuData={headerData[openMenu]}
                      onButtonMenu={(item: string) => handleButtonMenu(item)}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        ))}
      <MobileMenu
        menuData={headerData.mobileMenu}
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
      />
    </div>
  );
}
