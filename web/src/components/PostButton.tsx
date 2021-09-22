import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, IconButton } from "@chakra-ui/react";
import React from "react";

const PostButton = () => {
  return (
    <Box>
      <IconButton
        icon={<EditIcon></EditIcon>}
        aria-label="edit"
        mr={4}
      ></IconButton>
      <IconButton
        icon={<DeleteIcon></DeleteIcon>}
        aria-label="delete"
        colorScheme="red"
      ></IconButton>
    </Box>
  );
};

export default PostButton;
