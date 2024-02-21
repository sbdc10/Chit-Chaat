import {
    Avatar,
    Box,
    Button,
    Input,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Spinner,
    Text,
    Tooltip,
    useDisclosure,
} from "@chakra-ui/react";
import {
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import React, { useState } from "react";
import { ChatState } from "../../context/chatProvider";
import { ProfileModal } from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import useGlobalToast from "../../globalFunctions/toast";
import axios from "axios";
import { ChatLoading } from "./ChatLoading";
import { UserListItem } from "../UserAvatar/UserListItem";

const SideDrawer = () => {
    // Define the backend URL using an environment variable
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState();
    const { user, setSelectedChat, chats, setChats } = ChatState();
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();

    // use global toast function
    const toast = useGlobalToast();

    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        navigate("/");
    };
    const handleSearch = async () => {
        if (!search) {
            toast.warning("Warning", "Please Enter something in search");
            return;
        } else {
            setLoading(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            axios
                .get(`${BACKEND_URL}/api/user?search=${search}`, config)
                .then(({ data }) => {
                    console.log("users", data.users);
                    toast.success(data.message, "");

                    setSearchResult(data.users);
                })
                .catch((error) => {
                    toast.error(
                        "Error",
                        error.response ? error.response.data.message : "Something Went Wrong"
                    );
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    };

    // console.log("chats", chats);
    const accessChat = async (userId) => {
        console.log(userId);
        setLoadingChat(true);

        const config = {
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${user.token}`,
            },
        };

        axios
            .post(`${BACKEND_URL}/api/chat`, { userId }, config)
            .then(({ data }) => {
                console.log("res", data);
                toast.success(data.message, "");

                if (!chats.find((c) => c._id === data.data._id)) setChats([data.data, ...chats]);
                setSelectedChat(data.data);
            })
            .catch((error) => {
                console.log("error", error);
                toast.error(
                    "Error",
                    error.response ? error.response.data.message : "Something Went Wrong"
                );
            })
            .finally(() => {
                setLoadingChat(false);
                onClose();
            });
    };
    return (
        <>
            <Box
                display={"flex"}
                justifyContent={"space-between"}
                alignItems={"center"}
                bg={"white"}
                w={"100%"}
                p={"5px 10px 5px 10px"}
                borderWidth={"5px"}
            >
                <Tooltip label="Search users to chat" hasArrow placement="bottom-end">
                    <Button variant={"ghost"} onClick={onOpen}>
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <Text display={{ base: "none", md: "flex" }} px={"4"}>
                            Search User
                        </Text>
                    </Button>
                </Tooltip>
                <Text fontSize={"2xl"} fontFamily={"Work sans"}>
                    {" "}
                    Chit Chaat
                </Text>
                <Box>
                    <Menu>
                        <MenuButton p={1}>
                            <BellIcon fontSize={"2xl"} m={1} />
                        </MenuButton>
                        {/* <MenuList>
                            <MenuItem>New File</MenuItem>
                            <MenuItem>New Window</MenuItem>
                            <MenuDivider />
                            <MenuItem>Open...</MenuItem>
                            <MenuItem>Save File</MenuItem>
                        </MenuList> */}
                    </Menu>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                            {user.name}
                            <Avatar
                                size="sm"
                                cursor="pointer"
                                name={user.user.name}
                                src={user.user.dp}
                            />
                        </MenuButton>
                        <MenuList>
                            <ProfileModal user={user.user}>
                                <MenuItem>My Profile</MenuItem>
                            </ProfileModal>
                            <MenuDivider />
                            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                            {/* <MenuItem>Open...</MenuItem>
                            <MenuItem>Save File</MenuItem> */}
                        </MenuList>
                    </Menu>
                </Box>
            </Box>

            <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader borderBottomWidth={"1px"}>Search Users</DrawerHeader>

                    <DrawerBody>
                        <Box display={"flex"} mb={2}>
                            <Input
                                placeholder="Search by name or email"
                                mr={2}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button onClick={handleSearch}>Go</Button>
                        </Box>
                        {loading ? (
                            <ChatLoading />
                        ) : (
                            searchResult?.map((user) => (
                                <UserListItem
                                    key={user._id}
                                    user={user}
                                    handleFunction={() => accessChat(user._id)}
                                />
                            ))
                        )}
                        {loadingChat && <Spinner ml={"auto"} display={"flex"} />}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default SideDrawer;
