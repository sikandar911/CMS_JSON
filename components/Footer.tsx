"use client";

import React, { Fragment } from "react";
import Link from "next/link";
import classNames from "classnames";
import Image from "next/image";

const footer = {
  logo: "/uapp-logo.svg",
  altText: "uapp logo",
  description:
    "UAPP is an all-in-one platform which bridges the gap between universities and students, through technology and its consultant network across the world.",
  socialTitle: "Follow Us",
  social: [
    {
      name: "facebook",
      url: "",
    },
    {
      name: "twitter",
      url: "",
    },
    {
      name: "instagram",
      url: "",
    },
    {
      name: "linkedin",
      url: "",
    },
  ],
  linksLeft: [
    {
      title: "COMPANY",
      data: [
        {
          text: "Our Story",
          url: "",
        },
        {
          text: "Our Team",
          url: "",
        },
        {
          text: "Careers",
          url: "",
        },
        {
          text: "Blogs",
          url: "",
        },
      ],
    },
    {
      title: "SERVICES",
      data: [
        {
          text: "Sign In",
          url: "",
        },
        {
          text: "Join the Team",
          url: "",
        },
        {
          text: "Book Free Consultation",
          url: "",
        },
      ],
    },
  ],
  linksRight: [
    {
      title: "QUICK LINKS",
      data: [
        {
          text: "Our Partners",
          url: "",
        },
        {
          text: "Find Courses",
          url: "",
        },
        {
          text: "Contact us",
          url: "",
        },
      ],
    },
    {
      title: "LEGAL",
      data: [
        {
          text: "Cookies Policy",
          url: "",
        },
        {
          text: "Privacy Policy",
          url: "",
        },
      ],
    },
  ],
};

export default function Footer() {
  const socialIcons = {
    facebook: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="16"
        width="10"
        fill="currentColor"
        viewBox="0 0 320 512"
      >
        <path d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z" />
      </svg>
    ),
    twitter: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="16"
        width="16"
        fill="currentColor"
        viewBox="0 0 512 512"
      >
        <path d="M459.4 151.7c.3 4.5 .3 9.1 .3 13.6 0 138.7-105.6 298.6-298.6 298.6-59.5 0-114.7-17.2-161.1-47.1 8.4 1 16.6 1.3 25.3 1.3 49.1 0 94.2-16.6 130.3-44.8-46.1-1-84.8-31.2-98.1-72.8 6.5 1 13 1.6 19.8 1.6 9.4 0 18.8-1.3 27.6-3.6-48.1-9.7-84.1-52-84.1-103v-1.3c14 7.8 30.2 12.7 47.4 13.3-28.3-18.8-46.8-51-46.8-87.4 0-19.5 5.2-37.4 14.3-53 51.7 63.7 129.3 105.3 216.4 109.8-1.6-7.8-2.6-15.9-2.6-24 0-57.8 46.8-104.9 104.9-104.9 30.2 0 57.5 12.7 76.7 33.1 23.7-4.5 46.5-13.3 66.6-25.3-7.8 24.4-24.4 44.8-46.1 57.8 21.1-2.3 41.6-8.1 60.4-16.2-14.3 20.8-32.2 39.3-52.6 54.3z" />
      </svg>
    ),
    instagram: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="16"
        width="14"
        fill="currentColor"
        viewBox="0 0 448 512"
      >
        <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
      </svg>
    ),
    linkedin: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="16"
        width="14"
        fill="currentColor"
        viewBox="0 0 448 512"
      >
        <path d="M100.3 448H7.4V148.9h92.9zM53.8 108.1C24.1 108.1 0 83.5 0 53.8a53.8 53.8 0 0 1 107.6 0c0 29.7-24.1 54.3-53.8 54.3zM447.9 448h-92.7V302.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z" />
      </svg>
    ),
  };

  const handleLinkData = (data: { text: string; url: string }) => {
    return (
      <li>
        <Link href={data.url || "#"} className="hover:text-secondary">
          {data.text}
        </Link>
      </li>
    );
  };

  const handleFooterLink = (link: { title: string; data: { text: string; url: string }[] }) => {
    return (
      <div className="mb-6">
        <div className="font-semibold mb-2">{link.title}</div>
        <ul className="text-sm">
          {link.data.map((data, index) => {
            return <Fragment key={index}>{handleLinkData(data)}</Fragment>;
          })}
        </ul>
      </div>
    );
  };

  return (
    <div id="footer" className="bg-primary text-white">
      <div className="container mx-auto text-lg py-6 md:py-8">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="flex-1">
            <div className="relative w-[120px] md:w-[200px] h-[36px] md:h-[60px] mb-8">
              <Image
                src={footer.logo}
                alt={footer.altText}
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>

            <div className="flex">
              <div className="min-w-[102px] min-h-[102px] mb-4 mr-2">
                <Link href="#">
                  <Image
                    src="/icef.png"
                    alt="icef"
                    width={100}
                    height={100}
                    style={{ width: '100%', height: 'auto' }}
                  />
                </Link>
              </div>
              <p className="uapp-text-default mb-4 pr-0 md:pr-[20%]">
                {footer.description}
              </p>
            </div>

            <h5 className="font-bold">{footer.socialTitle}</h5>
            <div className="flex gap-3 mt-3">
              {footer.social.map((social, index) => {
                return (
                  <Fragment key={index}>
                    <Link
                      href={social.url || "#"}
                      target="_blank"
                      className={classNames(
                        "bg-white text-primary rounded-full w-12 h-12 flex items-center justify-center",
                        "social-" + social.name
                      )}
                    >
                      {socialIcons[social.name as keyof typeof socialIcons]}
                    </Link>
                  </Fragment>
                );
              })}
            </div>
          </div>
          <div className="flex flex-1 gap-5">
            <div className="flex-1">
              {footer.linksLeft.map((link, index) => {
                return (
                  <Fragment key={index}>{handleFooterLink(link)}</Fragment>
                );
              })}
            </div>
            <div className="flex-1">
              {footer.linksRight.map((link, index) => {
                return (
                  <Fragment key={index}>{handleFooterLink(link)}</Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#FFFFFF1F] h-[1px]"></div>
      <div className="container mx-auto flex flex-col md:flex-row items-center md:items-end md:justify-between py-4 text-[#9BBEBF]">
        <div className="text-center md:text-left">
          <div className="text-[12px]">
            GUCAP Ltd. T/A UAPP (Company No: 13664006)
          </div>
          <div className="text-[12px]">
            Registered Office : 19 Warton Road, London - E15 2GG
          </div>
        </div>
        <div className="text-sm/[12px]">
          ©{new Date().getFullYear()} UAPP. All Rights Reserved
        </div>
      </div>
    </div>
  );
}
