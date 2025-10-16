import React, { useState, useEffect } from "react";
import {
    Modal,
    Box,
    Button,
    TextField,
    Typography,
    Chip,
    Paper,
    CircularProgress,
    Autocomplete,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";
import { getTags, addUserTags } from "../services/authentication";

const scrollbarStyles = {
    px: 0,
    pr: 1.5,
    maxHeight: "62vh",
    overflowY: "auto",
    "&::-webkit-scrollbar": {
        width: "5px",
    },
    "&::-webkit-scrollbar-track": {
        backgroundColor: "#f5f5f5",
        borderRadius: "10px",
    },
    "&::-webkit-scrollbar-thumb": {
        backgroundColor: "#d6d6d6",
        borderRadius: "10px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
        backgroundColor: "#555",
    },
};

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 450,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: "12px",
};

const EditTagsModal = ({ open, onClose, userData }) => {
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [allTags, setAllTags] = useState([]);
    const [loadingTags, setLoadingTags] = useState(false);
    const [originalTags, setOriginalTags] = useState([]);

    useEffect(() => {
        if (open) {
            setTags([]);
            setOriginalTags([]);
            setNewTag("");
            fetchAllTags();
        }
    }, [open]);

    useEffect(() => {
        if (userData && userData.tags) {
            setTags(userData.tags || []);
            setOriginalTags(userData.tags.map(t => t));
        } else {
            setTags([]);
            setOriginalTags([]);
        }
    }, [userData]);

    const fetchAllTags = async () => {
        try {
            setLoadingTags(true);
            const response = await getTags();
            setAllTags(response.data || []);
        } catch (error) {
            toast.error("Failed to load existing tags");
        } finally {
            setLoadingTags(false);
        }
    };

    const handleAddTag = () => {
        const trimmedTag = newTag.trim();
        if (
            trimmedTag &&
            !tags.some((tag) => tag.toLowerCase() === trimmedTag.toLowerCase())
        ) {
            setTags([...tags, trimmedTag]);
            setNewTag("");
        } else if (trimmedTag) {
            toast.warning("Tag already exists");
        }
    };

    const handleDeleteTag = (tagToDelete) => {
        setTags(tags.filter((tag) => tag !== tagToDelete));
    };

    const handleSave = async () => {
        const currentTagNames = tags.map(tag => tag.name || tag);

        // Check if tags changed
        const tagsChanged =
            currentTagNames.length !== originalTags.length ||
            currentTagNames.some(tag => !originalTags.includes(tag));

        if (!tagsChanged) {
            toast.info("No changes detected");
            onClose();
            return;
        }

        try {
            setIsSubmitting(true);

            const payload = {
                id: userData?.user_id,
                tags: currentTagNames,
            };

            await addUserTags(payload);
            toast.success("Tags updated successfully");
            onClose();
        } catch (error) {
            toast.error(error.message || "Failed to update tags");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setNewTag("");
            onClose();
        }
    };


    // Get available tags (excluding already added ones)
    const availableTags = allTags.filter(
        (tag) => !tags.some((t) => t.toLowerCase() === tag.toLowerCase())
    );

    const currentTagNames = tags.map(t => t.name);
    const tagsChanged =
        currentTagNames.length !== originalTags.length ||
        currentTagNames.some(tag => !originalTags.includes(tag));

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <Typography variant="h3">
                    Edit Tags
                </Typography>

                <Box sx={scrollbarStyles}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "text.secondary",
                            mb: 2,
                            mt: 2,
                        }}
                    >
                        {userData?.name}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
                        <Autocomplete
                            fullWidth
                            freeSolo
                            options={availableTags}
                            value={newTag}
                            onInputChange={(event, newInputValue) => setNewTag(newInputValue.toLowerCase())}
                            onChange={(event, newValue) => {
                                if (newValue) setNewTag(String(newValue).toLowerCase());
                            }}
                            loading={loadingTags}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    size="small"
                                    placeholder="Enter or select tag"
                                    variant="outlined"
                                    autoComplete="off"
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddTag();
                                        }
                                    }}
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loadingTags ? (
                                                    <CircularProgress color="inherit" size={20} />
                                                ) : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            height: "40px",
                                        },
                                    }}
                                />
                            )}
                            noOptionsText="Type to create new tag"
                            sx={{
                                "& .MuiAutocomplete-inputRoot": {
                                    paddingTop: "0px",
                                    paddingBottom: "0px",
                                },
                            }}
                        />

                        <Button
                            variant="contained"
                            onClick={handleAddTag}
                            startIcon={<AddIcon />}
                            disabled={!newTag.trim()}
                            sx={{
                                textTransform: "none",
                                minWidth: "100px",
                                height: "40px",
                            }}
                        >
                            Add
                        </Button>
                    </Box>

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            borderColor: "grey.300",
                            minHeight: "150px",
                            backgroundColor: "#fafafa",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: loadingTags ? "center" : "flex-start",
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                mb: 1.5,
                                fontWeight: 600,
                                color: "text.primary",
                                alignSelf: "flex-start"
                            }}
                        >
                            Tags
                        </Typography>

                        {loadingTags ? (
                            <CircularProgress size={28} sx={{ mt: 4, mb: 2 }} />
                        ) : (
                            <Box
                                sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 1,
                                    width: "100%",
                                    minHeight: "80px",
                                }}
                            >
                                {tags.length > 0 ? (
                                    tags.map((tag) => (
                                        <Chip
                                            key={tag}
                                            label={tag}
                                            onDelete={() => handleDeleteTag(tag)}
                                            color="primary"
                                            variant="outlined"
                                            sx={{ fontSize: "14px", height: "32px" }}
                                        />
                                    ))
                                ) : (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: "100%",
                                            fontStyle: "italic",
                                            py: 2,
                                        }}
                                    >
                                        No tags added yet
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Paper>
                </Box>

                <Box mt={4} display="flex" justifyContent="flex-end" gap={1}>
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={isSubmitting || !tagsChanged}
                        aria-label="Save"
                    >
                        {isSubmitting ? (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <CircularProgress
                                    size={20}
                                    sx={{ color: "white" }}
                                />
                                <Typography sx={{ textTransform: "none", color: "white" }}>
                                    Saving...
                                </Typography>
                            </Box>
                        ) : (
                            "Save"
                        )}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default EditTagsModal;