import React, { useEffect, useState } from "react";
import { ChatState } from "../../context/chatProvider";
import useGlobalToast from "../../globalFunctions/toast";
import axios from "axios";
import { Box, Button, Stack, Text } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { ChatLoading } from "./ChatLoading";
import { getSender } from "../../config/chatLogics";
import { GroupChatModal } from "./GroupChatModal";

export const MyChats = ({ fetchAgain }) => {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    const [loggedUser, setLoggedUser] = useState();
    const toast = useGlobalToast();
    const { user, selectedChat, setSelectedChat, chats, setChats } = ChatState();

    const fetchChats = async () => {
        const config = {
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        };

        axios
            .get(`${BACKEND_URL}/api/chat`, config)
            .then(({ data }) => {
                // console.log("data", data);
                // toast.success(data.message, "");

                setChats(data.data);
            })
            .catch((error) => {
                toast.error(
                    "Error",
                    error.response ? error.response.data.message : "Something Went Wrong"
                );
            });
    };
    useEffect(() => {
        setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
        fetchChats();
    }, [fetchAgain]);
    return (
        <Box
            display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
            flexDir={"column"}
            alignItems={"center"}
            p={3}
            bg={"white"}
            w={{ base: "100%", md: "31%" }}
            borderRadius={"lg"}
            borderWidth={"1px"}
        >
            <Box
                pb={3}
                px={3}
                fontSize={"28px"}
                fontFamily={"Work sans"}
                display={"flex"}
                flexDir={{ base: "column", md: "column", lg: "column", xl: "row" }}
                flexWrap={"wrap"}
                w={"100%"}
                justifyContent={"space-between"}
                alignItems={"center"}
                borderBottom={"1px"}
                borderColor="gray.400"
            >
                My Chats
                <GroupChatModal>
                    <Button
                        display={"flex"}
                        fontSize={{ base: "17px", lg: "17px" }}
                        rightIcon={<AddIcon />}
                    >
                        New Group Chat
                    </Button>
                </GroupChatModal>
            </Box>
            <Box
                display={"flex"}
                flexDir={"column"}
                p={3}
                bg={"#F8F8F8"}
                w={"100%"}
                h={"100%"}
                borderRadius={"lg"}
                overflowY={"hidden"}
            >
                {chats ? (
                    <Stack overflowY={"scroll"}>
                        {chats.map((chat) => (
                            <Box
                                onClick={() => setSelectedChat(chat)}
                                cursor={"pointer"}
                                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                                color={selectedChat === chat ? "white" : "black"}
                                px={3}
                                py={2}
                                borderRadius={"lg"}
                                key={chat._id}
                            >
                                <Text>
                                    {!chat.isGroupChat
                                        ? getSender(loggedUser, chat.users)
                                        : chat.chatName}
                                </Text>
                            </Box>
                        ))}
                    </Stack>
                ) : (
                    <ChatLoading />
                )}
            </Box>
        </Box>
    );
};